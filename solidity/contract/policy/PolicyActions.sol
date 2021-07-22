/*
 * Copyright 2021 5DS.io, all rights reserved.
 *
 *  SPDX-License-Identifier: UNLICENSED
 */
pragma solidity ^0.8.3;

struct PendingAction {
  uint64 id;
  uint64 policyId;
  uint64[] authorizedChallenges;
  uint64[] deniedChallenges;
  uint64[] pendingChallenges;
  uint256 requestDate;
}

interface PolicyActions {

  function createPending(uint64 policyId) external returns (uint64);

  function getPending(uint64 pendingActionId) external returns (PendingAction memory);

  function authorize(uint64 pendingActionId) external;

  function deny(uint64 pendingActionId) external;
  
  function challengeResponse(uint64 pendingActionId, uint64 challengeId, bool approval) external; 

  function createPendingChallenge(
    uint64 organizationId,
    uint64 policyId,    
    uint64 pendingActionId,
    uint64 agentId,
    uint64 deviceId,
    string calldata deviceToken,
    string calldata challengeTitle,
    string calldata challengeMessage
  ) external;   

  function tick(uint256 timeoutSeconds) external;
}
