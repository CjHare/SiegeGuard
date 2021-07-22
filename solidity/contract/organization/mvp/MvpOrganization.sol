/*
 * Copyright 2021 5DS.io, all rights reserved.
 *
 *  SPDX-License-Identifier: UNLICENSED
 */
pragma solidity ^0.8.3;

import '../Organization.sol';
import '../../access-control/AccessControlled.sol';
import '../../challenge/Challenges.sol';
import '../../policy/Policies.sol';
import '../../validator/InputValidator.sol';
import '../../view/AgentChallengesView.sol';

contract MvpOrganization is Organization, AccessControlled, InputValidator {
  
  uint64 private _organizationId;
  string private _name;
  uint256 private _creationDate;

  AgentChallengesView private _agentChallengesView;
  Challenges private _challenges;
  Policies private _policies;

  constructor(
      address accessControl, 
      address agentChallengesView,
      address challenges,
      address policies,
      string memory name) AccessControlled(accessControl) {
    validateIsAddressNonZero(policies);   
    
    _policies = Policies(policies);    
    _name = name;
    _agentChallengesView = AgentChallengesView(agentChallengesView);
    _challenges = Challenges(challenges);
    _creationDate = block.timestamp;
  }

  function init(uint64 organizationId) external override {
    senderRequires(Role.ADMIN);  
    validateOrganizationId(organizationId);
    validationPolicyUnitialized();

    _organizationId = organizationId;          
  }

  function addPolicy(address uninitialzedPolicy) external override {
    senderRequires(Role.ADMIN);  
    validatePolicyInitialized();

    _policies.add(uninitialzedPolicy, _organizationId);
  }

  function startAuthorization(uint64 policyId) external override { 
    senderRequires(Role.ADMIN);  
    validatePolicyId(policyId);
    validatePolicyInitialized();

    _policies.startAuthorization(policyId);
  }

  function challengeResponse(
    uint64 policyId, 
    uint64 pendingActionId, 
    uint64 challengeId, 
    bool approval) external override {
    senderRequires(Role.ADMIN);  
    validatePolicyId(policyId);
    validatePendingActionId(pendingActionId);    
    validateChallengeId(challengeId);
    validatePolicyInitialized();

    _policies.challengeResponse(policyId, pendingActionId, challengeId, approval);
  }

  function tick() external override {
    senderRequires(Role.ADMIN);  
    validatePolicyInitialized();

    _policies.tick();
  }

  function agentChallengeViewAddress() external override view returns (address) {
    senderRequires(Role.USER);  

    return address(_agentChallengesView);
  }

  function agentChallengeViewAddress(address agentChallengesView) external {
    senderRequires(Role.ADMIN);  

    _agentChallengesView = AgentChallengesView(agentChallengesView);
  }  

  function challengesAddress() external view returns (address) {
    senderRequires(Role.USER);  

    return address(_challenges);
  }

  function challengesAddress(address challenges) external {
    senderRequires(Role.ADMIN);  

    _challenges = Challenges(challenges);
  }  

  function getOrganizationId() external view returns (uint64){
    return _organizationId;
  }

  function getPoliciesAddress() external view returns (address){
    senderRequires(Role.USER);  
    
    return address(_policies);
  }

  function getName() external view returns (string memory){
    senderRequires(Role.USER);  
    
    return _name;
  }

  function getCreationDate() external view returns (uint256){
    senderRequires(Role.USER);  

    return _creationDate;
  }

  function updatePoliciesAddress(address policies) external {
    senderRequires(Role.OWNER);  

   _policies = Policies(policies);    
  }

  function validatePolicyInitialized() private view {
    require( _organizationId > 0, "Organization must be initialized before use");
  }

  function validationPolicyUnitialized() private view {
    require( _organizationId == 0, "Organization is already initialized");
  }  
}
