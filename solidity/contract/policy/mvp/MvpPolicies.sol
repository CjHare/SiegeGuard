/*
 * Copyright 2021 5DS.io, all rights reserved.
 *
 *  SPDX-License-Identifier: UNLICENSED
 */
pragma solidity ^0.8.3;

import '../Policies.sol';
import '../Policy.sol';
import '../../access-control/AccessControlled.sol';
import '../../validator/InputValidator.sol';

contract MvpPolicies is Policies, AccessControlled, InputValidator {

  uint64 private _policyIdPool;
  mapping(uint64 => Policy) private _policies;
  uint64[] private _policyKeys;

  constructor(address accessControl) AccessControlled(accessControl) {
    _policyIdPool = 1;      
  }

  function startAuthorization(uint64 policyId) external override {
    senderRequires(Role.ADMIN); 
    validatePolicyId(policyId); 
    validatePolicyExists(policyId);

    _policies[policyId].startAuthorization();
  }

  function challengeResponse(
    uint64 policyId, 
    uint64 pendingActionId, 
    uint64 challengeId, 
    bool approval) external override {
    senderRequires(Role.ADMIN);  
    validatePolicyId(policyId); 
    validateActionId(pendingActionId);
    validateChallengeId(challengeId);
    validatePolicyExists(policyId);

    _policies[policyId].challengeResponse(pendingActionId, challengeId, approval);
  }

  function tick() external override {
    senderRequires(Role.ADMIN);  

    for(uint i = 0; i < _policyKeys.length; i++){
      _policies[_policyKeys[i]].tick();
    }
  }

  function lastPolicyId() external override view returns (uint64) {
    senderRequires(Role.USER);  

    return _policyIdPool-1;
  }    

  /**
   * Always returns a value, when the entry doesn't exist, the return object is uninitialized.
   */
  function get(uint64 policyId) external override view returns (address) {
    senderRequires(Role.USER);  
    validatePolicyId(policyId);

    return address(_policies[policyId]);
  }    

  function add(address uninitialzedPolicy, uint64 organizationId) external override {
    senderRequires(Role.ADMIN);      
    validateIsAddressNonZero(uninitialzedPolicy);        
    validateOrganizationId(organizationId);
    
    uint64 policyId = _policyIdPool;
    _policies[policyId] = Policy(uninitialzedPolicy);
    _policies[policyId].init(organizationId, policyId);
    _policyIdPool++;
    addPolicyKey(policyId);

    emit addedPolicy(policyId);
  }

  function remove(uint64 policyId) external override {
    senderRequires(Role.ADMIN);  
    validatePolicyId(policyId);
    validatePolicyExists(policyId);

    removePolicy(policyId);

    emit removedPolicy(policyId);
  }

  function removePolicy(uint64 key) private {
    delete _policies[key];

    for(uint i = 0; i < _policyKeys.length; i++ ){
      if(_policyKeys[i] == key){
        delete _policyKeys[i];
        return;
      }
    }
  }

  function addPolicyKey(uint64 key) private {
    for(uint i = 0; i < _policyKeys.length; i++ ){
      if(_policyKeys[i] == 0){
        _policyKeys[i] = key;
        return;
      }
    }

    _policyKeys.push(key);
  } 

   function validatePolicyExists(uint64 policyId) private view {
    require(address(_policies[policyId]) != address(0), 'PolicyId not found amongst current polcy set');
  }       
}
