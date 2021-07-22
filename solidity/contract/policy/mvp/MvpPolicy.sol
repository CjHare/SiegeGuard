/*
 * Copyright 2021 5DS.io, all rights reserved.
 *
 *  SPDX-License-Identifier: UNLICENSED
 */
pragma solidity ^0.8.3;

import '../Policy.sol';
import '../PolicyActions.sol';
import '../PolicyDevices.sol';
import '../../access-control/AccessControlled.sol';
import '../../validator/InputValidator.sol';

/**
 * M of N Agents authorization policy for the MVP.
 */
contract MvpPolicy is Policy, AccessControlled, InputValidator {
  
  enum ActionState {Uninitialized, Approved, Denied, Pending}

  PolicyActions private _actions;
  PolicyDevices private _devices;

  uint256 private _creationDate;
  uint256 private _timeoutSeconds;
  uint64[] private _approverAgentIds;
  string private _challengeTitle;
  string private _challengeMessage;
  uint64 private _organizationId;
  uint64 private _policyId;
  string private _policyTitle;
  uint8 private _approvalsRequired;

  event authorizeAction(
    uint64 organizationId, 
    uint64 policyId, 
    uint64 actionId
  );

  constructor(
      address accessControl, 
      address actions,
      address devices,
      string memory policyTitle) AccessControlled(accessControl) {
    validateIsAddressNonZero(actions);   
    validateIsAddressNonZero(devices);       

    validatePolicyTitle(policyTitle);

    _actions = PolicyActions(actions);
    _devices = PolicyDevices(devices);

    _policyTitle = policyTitle;
  }

  function initChallenge(      
      string memory challengeTitle, 
      string memory challengeMessage, 
      uint64[] memory approverAgentIds, 
      uint8 approvalsRequired,
      uint256 timeoutSeconds) external override {
    senderRequires(Role.ADMIN);  
    validateChallengeTitle(challengeTitle);
    validateChallengeMessage(challengeMessage);
    validationPolicyChallengeUnitialized();

    _challengeTitle = challengeTitle;
    _challengeMessage = challengeMessage;
    _approvalsRequired = approvalsRequired;
    _timeoutSeconds = timeoutSeconds;
    _creationDate = block.timestamp;

    // If/when memory to storage array copying works again in solc, replace with: _approverAgentIds=approverAgentIds;
    for(uint i = 0; i< approverAgentIds.length; i++){
      validateAgentId(approverAgentIds[i]);
      _approverAgentIds.push(approverAgentIds[i]);
    }
  }

  function init(uint64 organizationId, uint64 policyId) external override {
    senderRequires(Role.ADMIN);  
    validateOrganizationId(organizationId);
    validatePolicyId(policyId);    
    validationPolicyUnitialized();

    _organizationId = organizationId;
    _policyId = policyId;
  }

  /**
   * The MVP Policy is a single step requiring a confirmation response
   */
  function startAuthorization() external override {
    senderRequires(Role.ADMIN);  
    validatePolicyInitialized();

    uint64 pendingActionId = _actions.createPending(_policyId);
    validateActionId(pendingActionId);    

    uint sentChallengeCount = 0;      
    for(uint i=0; i < _approverAgentIds.length; i++){
      sentChallengeCount += createChallengesForDevices(pendingActionId, _approverAgentIds[i]);
    }

    if(sentChallengeCount < _approvalsRequired){
      revert("Insufficient Challenges sent to satisfy approval criteria");
    }    
  }

  function createChallengesForDevices(uint64 pendingActionId, uint64 agentId) private returns (uint){
      Device[] memory agentDevices = _devices.agentDevices(agentId);
      uint sentChallengeCount = 0;  

      for(uint j=0; j < agentDevices.length; j++){
        _actions.createPendingChallenge(
          _organizationId,
          _policyId,
          pendingActionId,
          agentId,
          agentDevices[j].deviceId,
          agentDevices[j].token,
          _challengeTitle,
          _challengeMessage
        );

        sentChallengeCount++;
      }      

      return sentChallengeCount;
  }

  /**
   * FSA for the policy is a one step with a minimum approval count
   */
  function challengeResponse(uint64 pendingActionId, uint64 challengeId, bool approval) external override {
    senderRequires(Role.ADMIN);  
    validatePolicyInitialized();
    validatePendingActionId(pendingActionId);
    validateChallengeId(challengeId);

    _actions.challengeResponse(pendingActionId, challengeId, approval);

    PendingAction memory action = _actions.getPending(pendingActionId);

    if(hasReachedApproval(action)){      
      _actions.authorize(pendingActionId);

    } else if(cannotReachApproval(action)) {
      _actions.deny(pendingActionId);
    }
  }

  function tick() external override {
    senderRequires(Role.ADMIN);  
    validatePolicyInitialized();

    _actions.tick(_timeoutSeconds);
  }  

  function getCreationDate() external view returns (uint256){
    senderRequires(Role.USER);  

    return _creationDate;
  }

  function getPolciyActionsAddress() external view returns (address){
    senderRequires(Role.USER);  
    
    return address(_actions);
  }

  function getPolicyDevicesAddress() external view returns (address){
    senderRequires(Role.USER);  
    
    return address(_devices);
  }

  function updatePolicyDevicesAddress(address devices) external {
    senderRequires(Role.OWNER);  
    
    _devices = PolicyDevices(devices);
  }

  function updatePolicyActionsAddress(address actions) external {
    senderRequires(Role.OWNER);  
    
    _actions = PolicyActions(actions);
  }

  function getTimeoutSeconds() external view returns (uint256){
    senderRequires(Role.USER);  

    return _timeoutSeconds;
  }

  function getApproverAgentIds() external view returns (uint64[] memory){
    senderRequires(Role.USER);  

    return _approverAgentIds;
  }

  function getChallengeTitle() external view returns (string memory){
    senderRequires(Role.USER);  

    return _challengeTitle;
  }

  function getChallengeMessage() external view returns (string memory){
    senderRequires(Role.USER);  

    return _challengeMessage;
  }

  function getOrganizationId() external view returns (uint64){
    senderRequires(Role.USER);  

    return _organizationId;
  }

  function getPolicyId() external view returns (uint64){
    senderRequires(Role.USER);  

    return _policyId;
  }

  function getPolicyTitle() external view returns (string memory){
    senderRequires(Role.USER);  

    return _policyTitle;
  }

  function getApprovalsRequired() external view returns (uint8){
    senderRequires(Role.USER);  

    return _approvalsRequired;
  }

  function cannotReachApproval(PendingAction memory action) private view returns (bool){
    // pending challenges does not get resized when authorizing/denying challenges
    return (action.pendingChallenges.length - action.deniedChallenges.length) < _approvalsRequired;
  }

  function hasReachedApproval(PendingAction memory action) private view returns (bool){
    return action.authorizedChallenges.length >= _approvalsRequired;
  }

  function validatePolicyInitialized() private view {
    require(
      _organizationId > 0 && 
      _policyId > 0 && 
      _timeoutSeconds > 0 &&
      bytes(_challengeTitle).length > 0 &&
      bytes(_challengeMessage).length > 0 && 
      _approvalsRequired > 0 &&
      _timeoutSeconds > 0 &&
      _creationDate > 0
      , "Policy must be initialized before using");
  }

  function validationPolicyUnitialized() private view {
    require( _organizationId == 0 && _policyId == 0, "Policy is already initialized");
  }    

  function validationPolicyChallengeUnitialized() private view {
    require(      
      _timeoutSeconds == 0 &&
      bytes(_challengeTitle).length == 0 &&
      bytes(_challengeMessage).length == 0 && 
      _approvalsRequired == 0 &&
      _timeoutSeconds == 0 &&
      _creationDate == 0, "Policy is already initialized");
  }    
}