/*
 * Copyright 2021 5DS.io, all rights reserved.
 *
 *  SPDX-License-Identifier: UNLICENSED
 */
pragma solidity ^0.8.3;

import '../MvpAgentChallengesView.sol';
import '../Challenger.sol';
import '../Challenges.sol';
import '../../access-control/AccessControlled.sol';
import '../../validator/InputValidator.sol';

contract MvpChallenges is Challenges, AccessControlled, InputValidator, MvpAgentChallengesView {

  uint64 private _challengeIdPool;
  Challenger private _challenger;
  mapping(uint64 => AuthorizedChallenge) private _authorized;
  mapping(uint64 => DeniedChallenge) private _denied;  
  mapping(uint64 => PendingChallenge) private _pending;

  constructor(address accessControl, address challenger) AccessControlled(accessControl) {
    validateIsAddressNonZero(challenger);   

    _challenger = Challenger(challenger);
    _challengeIdPool = 1;
  }  
  
  /**
   * Challenge Ids are assigned sequentially starting at one. 
   * The set of Challenge Ids are one to count inclusively.
   */
  function lastChallengeId() external view returns (uint64) {
    senderRequires(Role.USER);  

    return _challengeIdPool-1;
  }  

  /**
   * Always returns a value, when the entry doesn't exist, the return object is uninitialized.
   */
  function getPending(uint64 challengeId) external view returns (PendingChallenge memory) {
    senderRequires(Role.USER);  
    validateChallengeId(challengeId);

    return _pending[challengeId];
  }  

  /**
   * Always returns a value, when the entry doesn't exist, the return object is uninitialized.
   */
  function getDenied(uint64 challengeId) external view returns (DeniedChallenge memory) {
    senderRequires(Role.USER);  
    validateChallengeId(challengeId);

    return _denied[challengeId];
  }  

  /**
   * Always returns a value, when the entry doesn't exist, the return object is uninitialized.
   */
  function getAuthorized(uint64 challengeId) external view returns (AuthorizedChallenge memory) {
    senderRequires(Role.USER);  
    validateChallengeId(challengeId);

    return _authorized[challengeId];
  }  
  
  function createPending(
    uint64 organizationId,
    uint64 policyId,    
    uint64 actionId,
    uint64 agentId,    
    uint64 deviceId,
    string calldata deviceToken,
    string calldata challengeTitle,
    string calldata challengeMessage
  ) external override returns (uint64) {
    senderRequires(Role.ADMIN);     
    validateOrganizationId(organizationId);
    validatePolicyId(policyId);
    validateActionId(actionId);
    validateAgentId(agentId);    
    validateDeviceId(deviceId);
    validateDeviceToken(deviceToken);
    validateChallengeTitle(challengeTitle);
    validateChallengeMessage(challengeMessage);

    uint64 id = _challengeIdPool;
    PendingChallenge storage creation = _pending[id];
    creation.policyId = policyId;
    creation.actionId = actionId;
    creation.agentId = agentId;
    creation.deviceId = deviceId;
    creation.deviceToken = deviceToken;
    creation.challengeId = id;
    creation.challengeTitle = challengeTitle;
    creation.challengeMessage = challengeMessage;
    creation.emitDate = block.timestamp; 

    _challenger.issue(
      organizationId, 
      policyId, 
      actionId, 
      deviceId, 
      deviceToken, 
      id,
      challengeTitle, 
     challengeMessage);

    _challengeIdPool++;

    emit createdPendingChallenge(creation);

    pendingChallengeForAgent(agentId, id);

    return id;
  }  

  /**
   * When id is present in any of the pending, denied or authorized sets deletes it, otherwise reverts transaction.
   */
  function remove(uint64 challengeId) external {
    senderRequires(Role.ADMIN);  
    validateChallengeId(challengeId);
    validateChallengeExists(challengeId);

    delete _pending[challengeId];   
    delete _authorized[challengeId];     
    delete _denied[challengeId];   
  }

  function authorize(uint64 challengeId) external override {
    senderRequires(Role.ADMIN);  
    validateChallengeId(challengeId);
    validatePending(challengeId);

    PendingChallenge storage pending = _pending[challengeId];
    AuthorizedChallenge storage authorized = _authorized[challengeId];
    authorized.policyId = pending.policyId;
    authorized.actionId = pending.actionId;
    authorized.agentId = pending.agentId;
    authorized.deviceId = pending.deviceId;
    authorized.deviceToken = pending.deviceToken;
    authorized.challengeId = pending.challengeId;
    authorized.challengeTitle = pending.challengeTitle;
    authorized.challengeMessage = pending.challengeMessage;
    authorized.emitDate = pending.emitDate;
    authorized.authorizedDate = block.timestamp;    

    authorizedChallengeForAgent(authorized.agentId, authorized.challengeId);

    delete _pending[challengeId];  

    emit createdAuthorizedChallenge(authorized);
  }

  function deny(uint64 challengeId) external override {
    senderRequires(Role.ADMIN);  
    validateChallengeId(challengeId);
    validatePending(challengeId);

    PendingChallenge storage pending = _pending[challengeId];
    DeniedChallenge storage denied = _denied[challengeId];
    denied.policyId = pending.policyId;
    denied.actionId = pending.actionId;
    denied.agentId = pending.agentId;
    denied.deviceId = pending.deviceId;
    denied.deviceToken = pending.deviceToken;
    denied.challengeId = pending.challengeId;
    denied.challengeTitle = pending.challengeTitle;
    denied.challengeMessage = pending.challengeMessage;
    denied.emitDate = pending.emitDate;
    denied.deniedDate = block.timestamp;    

    deniedChallengeForAgent(denied.agentId, denied.challengeId);

    delete _pending[challengeId];   

    emit createdDeniedChallenge(denied);
  }

  function getChallengerAddress() external view returns (address){
    senderRequires(Role.USER);  
    
    return address(_challenger);
  }

  function updateChallengerAddress(address challenger) external {
    senderRequires(Role.OWNER);  
    
    _challenger = Challenger(challenger);
  }

  function validatePending(uint64 challengeId) private view {
    require( isPending(challengeId), "challengeId is not found among the Pending challenges");
  }

  function validateChallengeExists(uint64 challengeId) private view {
    require(
     isAuthorized(challengeId) || isDenied(challengeId) || isPending(challengeId),
      'challengeId is not found among the Pending, Denied or Authorized challenges');
  }

  function isPending(uint64 challengeId) private view returns (bool){
    return  _pending[challengeId].challengeId > 0;
  }

  function isDenied(uint64 challengeId) private view returns (bool){
    return  _denied[challengeId].challengeId > 0;
  }

  function isAuthorized(uint64 challengeId) private view returns (bool){
    return  _authorized[challengeId].challengeId > 0;
  }
}
