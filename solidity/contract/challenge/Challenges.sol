/*
 * Copyright 2021 5DS.io, all rights reserved.
 *
 *  SPDX-License-Identifier: UNLICENSED
 */
pragma solidity ^0.8.3;

struct AuthorizedChallenge {
  uint64 policyId;
  uint64 actionId;
  uint64 agentId;
  uint64 deviceId;
  string deviceToken;
  uint64 challengeId;
  string challengeTitle;
  string challengeMessage;
  uint256 emitDate;
  uint256 authorizedDate;
}

struct DeniedChallenge {
  uint64 policyId;
  uint64 actionId;
  uint64 agentId;
  uint64 deviceId;
  string deviceToken;
  uint64 challengeId;
  string challengeTitle;
  string challengeMessage;
  uint256 emitDate;
  uint256 deniedDate;
}

struct PendingChallenge {
  uint64 policyId;
  uint64 actionId;
  uint64 agentId;
  uint64 deviceId;
  string deviceToken;
  uint64 challengeId;
  string challengeTitle;
  string challengeMessage;
  uint256 emitDate;
}

interface Challenges {

  event createdAuthorizedChallenge(
    AuthorizedChallenge challenge
  );
  event createdDeniedChallenge(
    DeniedChallenge challenge
  );  
  event createdPendingChallenge(
    PendingChallenge challenge
  );
  
  function createPending(
    uint64 organizationId,
    uint64 policyId,    
    uint64 actionId,
    uint64 agentId,
    uint64 deviceId,
    string calldata deviceToken,
    string calldata challengeTitle,
    string calldata challengeMessage
  ) external returns (uint64);     

  function authorize(uint64 challengeId) external;

  function deny(uint64 challengeId) external;
}