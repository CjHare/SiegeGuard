/*
 * Copyright 2021 5DS.io, all rights reserved.
 *
 *  SPDX-License-Identifier: UNLICENSED
 */
pragma solidity ^0.8.3;

import '../Actions.sol';
import '../../access-control/AccessControlled.sol';
import '../../challenge/Challenges.sol';
import '../../validator/InputValidator.sol';

contract MvpActions is Actions, AccessControlled, InputValidator {

  uint64 private _actionIdPool;
  mapping(uint64 => AuthorizedAction) private _authorized;
  mapping(uint64 => DeniedAction) private _denied;  
  mapping(uint64 => PendingAction) private _pending;
  uint64[] private _pendingKeys;

  Challenges private _challenges;

  constructor(address accessControl, address challenges) AccessControlled(accessControl) {
    validateIsAddressNonZero(challenges);   
    
    _challenges = Challenges(challenges);
    _actionIdPool = 1;
  }  
  
  /**
   * Action Ids are assigned sequentially starting at one. 
   * The set of Action Ids are one to count inclusively.
   */
  function lastActionId() external view returns (uint64) {
    senderRequires(Role.USER);  

    return _actionIdPool-1;
  }  

  /**
   * Always returns a value, when the entry doesn't exist, the return object is uninitialized.
   */
  function getPending(uint64 actionId) external override view returns (PendingAction memory) {
    senderRequires(Role.USER);  
    validateActionId(actionId);

    return _pending[actionId];
  }  

  /**
   * Always returns a value, when the entry doesn't exist, the return object is uninitialized.
   */
  function getDenied(uint64 actionId) external view returns (DeniedAction memory) {
    senderRequires(Role.USER);  
    validateActionId(actionId);

    return _denied[actionId];
  }  

  /**
   * Always returns a value, when the entry doesn't exist, the return object is uninitialized.
   */
  function getAuthorized(uint64 actionId) external view returns (AuthorizedAction memory) {
    senderRequires(Role.USER);  
    validateActionId(actionId);

    return _authorized[actionId];
  }  
  
  function createPending(
    uint64 policyId    
  ) external override returns (uint64) {
    senderRequires(Role.ADMIN);     
    validatePolicyId(policyId);

    PendingAction storage creation = _pending[_actionIdPool];
    creation.id = _actionIdPool; 
    creation.policyId = policyId;
    creation.requestDate = block.timestamp; 
    addPendingActionKey(creation.id);

    _actionIdPool++;

    emit createdPendingAction(creation);

    return creation.id;
  }  

  /**
   * When id is present in any of the pending, denied or authorized sets deletes it, otherwise reverts transaction.
   */
  function remove(uint64 actionId) external {
    senderRequires(Role.ADMIN);  
    validateActionId(actionId);
    validateActionExists(actionId);

    if(_pending[actionId].id > 0){
      removePendingAction(actionId);
    }else if(_authorized[actionId].id > 0){
      delete _authorized[actionId];     
    }else if(_denied[actionId].id > 0){
      delete _denied[actionId];   
    }else{
      revert("ActionId not found amongst the pending, authorized or denied actions");
    }
  }

  function authorize(uint64 actionId) external override {
    senderRequires(Role.ADMIN);  
    validateActionId(actionId);
    validatePending(actionId);

    PendingAction storage pending = _pending[actionId];
    AuthorizedAction storage authorized = _authorized[actionId];

    authorized.id = pending.id;
    authorized.policyId = pending.policyId;
    authorized.authorizedChallenges = pending.authorizedChallenges;
    authorized.deniedChallenges = pending.deniedChallenges;
    copyNonEmptyElements(pending.pendingChallenges, authorized.pendingChallenges);    
    authorized.requestDate = pending.requestDate;
    authorized.authorizedDate = block.timestamp;    

    removePendingAction(actionId);

    emit createdAuthorizedAction(authorized);
  }

  function deny(uint64 actionId) external override {
    senderRequires(Role.ADMIN);  
    validateActionId(actionId);
    validatePending(actionId);

    denyAction(actionId);
  }

  function createPendingChallenge(
    uint64 organizationId,
    uint64 policyId,    
    uint64 pendingActionId,
    uint64 agentId,
    uint64 deviceId,
    string calldata deviceToken,
    string calldata challengeTitle,
    string calldata challengeMessage
  ) external override {
    senderRequires(Role.ADMIN);  
    validateOrganizationId(organizationId);
    validatePolicyId(policyId);
    validateActionId(pendingActionId);     
    validateAgentId(agentId);     
    validateDeviceId(deviceId);  
    validateDeviceToken(deviceToken);  
    validateChallengeTitle(challengeTitle);  
    validateChallengeMessage(challengeMessage);
    validatePendingActionExists(pendingActionId);

    uint64 pendingChallengeId = _challenges.createPending(
      organizationId,
      policyId,
      pendingActionId,
      agentId,
      deviceId,
      deviceToken,
      challengeTitle,
      challengeMessage
    );    

    _pending[pendingActionId].pendingChallenges.push(pendingChallengeId);
  }  

  function authorizePendingChallenge(uint64 actionId, uint64 challengeId) external {
    senderRequires(Role.ADMIN);  
    validateActionId(actionId);     
    validatePendingActionExists(actionId);
    validateChallengeId(challengeId);          
    
    uint64[] storage pendingChallenges = _pending[actionId].pendingChallenges;
    uint index = indexOf(challengeId, pendingChallenges);
    uint64 authorizing = pendingChallenges[index];
    _pending[actionId].authorizedChallenges.push(authorizing);
    delete pendingChallenges[index];
  }

  function denyPendingChallenge(uint64 actionId, uint64 challengeId) external {
    senderRequires(Role.ADMIN);  
    validateActionId(actionId);     
    validatePendingActionExists(actionId);
    validateChallengeId(challengeId);          

    uint64[] storage pendingChallenges = _pending[actionId].pendingChallenges;
    uint index = indexOf(challengeId, pendingChallenges);
    uint64 denying = pendingChallenges[index];
    _pending[actionId].deniedChallenges.push(denying);
    delete pendingChallenges[index];    
  }

  function challengeResponse(uint64 pendingActionId, uint64 challengeId, bool approval) external override {
    senderRequires(Role.ADMIN);          
    validatePendingActionExists(pendingActionId);
    validatePendingActionHasPendingChallenge(pendingActionId, challengeId);    

    if(approval){
      
      _challenges.authorize(challengeId);
      _pending[pendingActionId].authorizedChallenges.push(challengeId);
      delete _pending[pendingActionId].pendingChallenges[challengeId];

    }else {

      _challenges.deny(challengeId);
      _pending[pendingActionId].deniedChallenges.push(challengeId);
      delete _pending[pendingActionId].pendingChallenges[challengeId];
    }
  }

  function tick(uint256 timeoutSeconds) external override {
    senderRequires(Role.ADMIN);  

    for(uint i = 0; i < _pendingKeys.length; i++){      
      if(isPending(_pendingKeys[i]) &&  block.timestamp > _pending[_pendingKeys[i]].requestDate + timeoutSeconds){
        denyAction(_pendingKeys[i]);
      }
    }
  }
  
  function getChallengesAddress() external view returns (address){
    senderRequires(Role.USER);  
    
    return address(_challenges);
  }

  function updateChallengesAddress(address challenges) external {
    senderRequires(Role.OWNER);  
    
   _challenges = Challenges(challenges);    
  }

  function denyAction(uint64 actionId) private {
    PendingAction storage pending = _pending[actionId];
    DeniedAction storage denied = _denied[actionId];
    denied.id = pending.id;
    denied.policyId = pending.policyId;
    denied.authorizedChallenges = pending.authorizedChallenges;
    denied.deniedChallenges = pending.deniedChallenges;
    copyNonEmptyElements(pending.pendingChallenges, denied.pendingChallenges);
    denied.requestDate = pending.requestDate;
    denied.deniedDate = block.timestamp;    

    removePendingAction(actionId);

    emit createdDeniedAction(denied);
  } 

  function removePendingAction(uint64 key) private {
    delete _pending[key];

    for(uint i = 0; i < _pendingKeys.length; i++ ){
      if(_pendingKeys[i] == key){
        delete _pendingKeys[i];
        return;
      }
    }
  }

  function addPendingActionKey(uint64 key) private {
    for(uint i = 0; i < _pendingKeys.length; i++ ){
      if(_pendingKeys[i] == 0){
        _pendingKeys[i] = key;
        return;
      }
    }

    _pendingKeys.push(key);
  }

  function copyNonEmptyElements(uint64[] storage from, uint64[] storage to) private {
    for(uint i = 0; i < from.length; i++){
        if(from[i] > 0){
            to.push(from[i]);
        }
    }
  }

  function indexOf(uint64 seeking, uint64[] storage pool) private view returns (uint) {
    for (uint i = 0; i < pool.length; i++) {
        if(pool[i] == seeking) {
          return i;
        }
      }    

   revert("Expecting to have found the index of the Pending Challenge");
  }

  function validatePendingActionHasPendingChallenge(uint64 actionId, uint64 challengeId) private view {
    require(
      _pending[actionId].pendingChallenges[challengeId] > 0, 
      "ChallengeId not found among the pending action's, remaining pending challenges");
  }

  function validatePending(uint64 id) private view {
    require(isPending(id), "ActionId is not found among the Pending actions");
  }

  function validatePendingActionExists(uint64 id) private view {
    require(
    isPending(id) && id <  _actionIdPool,
      'ActionId is not found among the Pending actions');
  }

  function validateActionExists(uint64 id) private view {
    require(
     (isAuthorized(id) || isDenied(id) || isPending(id)) && id <  _actionIdPool,
      'ActionId is not found among the Pending, Denied or Authorized actions');
  }

  function isPending(uint64 actionId) private view returns (bool){
    return  _pending[actionId].id > 0;
  }

  function isDenied(uint64 actionId) private view returns (bool){
    return  _denied[actionId].id > 0;
  }

  function isAuthorized(uint64 actionId) private view returns (bool){
    return  _authorized[actionId].id > 0;
  }
}
