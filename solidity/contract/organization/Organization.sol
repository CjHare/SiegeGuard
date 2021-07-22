/*
 * Copyright 2021 5DS.io, all rights reserved.
 *
 *  SPDX-License-Identifier: UNLICENSED
 */
pragma solidity ^0.8.3;

interface Organization {

  /**
   * Once off initialization required before using Organization.
   */
  function init(uint64 organizationId) external;

  /**
   * Begins a new journey on the authorization path provided by the Policy.
   */
  function startAuthorization(uint64 policyId) external;

  /**
   * Updates the state of a Policy instance with an Agent's response to a challenge.
   */
  function challengeResponse(
    uint64 policyId, 
    uint64 pendingActionId, 
    uint64 challengeId, 
    bool approval) external;

  function tick() external;    

  function addPolicy(address uninitialzedPolicy) external;  

  function agentChallengeViewAddress() external view returns (address);
}
