/*
 * Copyright 2021 5DS.io, all rights reserved.
 *
 *  SPDX-License-Identifier: UNLICENSED
 */
pragma solidity ^0.8.3;

/**
 * Provides a view of on the Agent and Challenges data sets from the perspective of a single Agent.
 */
interface AgentChallengesView {  

  function authorizedChallengeIdsForAgent(uint64 agentId) external view returns (uint64[] memory challenges);

  function deniedChallengeIdsForAgent(uint64 agentId) external view  returns (uint64[] memory challenges);

  function pendingChallengeIdsForAgent(uint64 agentId) external view  returns (uint64[] memory challengeIds);
}
