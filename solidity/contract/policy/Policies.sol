/*
 * Copyright 2021 5DS.io, all rights reserved.
 *
 *  SPDX-License-Identifier: UNLICENSED
 */
pragma solidity ^0.8.3;

interface Policies {

  event addedPolicy(
    uint64 policyId
  );    
  
  event removedPolicy(
    uint64 policyId
  );

  function startAuthorization(uint64 policyId) external;

  function challengeResponse(uint64 policyId, uint64 pendingActionId, uint64 challengeId, bool approval) external;

  function tick() external;  

  /**
   * Policy Ids are assigned sequentially starting at one. 
   * The set of Policy Ids are one to count inclusively.
   */
  function lastPolicyId() external view returns (uint64);

  function add(address uninitialzedPolicy, uint64 organizationId) external;

  /**
   * Always returns a value, when the entry doesn't exist, the return object is uninitialized i.e. zero address.
   */
  function get(uint64 policyId) external view returns (address);

  /**
   * When id is present it is removed, otherwise the transaction is reverted. 
   */
  function remove(uint64 policyId) external;
}
