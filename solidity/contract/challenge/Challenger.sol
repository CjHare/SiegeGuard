/*
 * Copyright 2021 5DS.io, all rights reserved.
 *
 *  SPDX-License-Identifier: UNLICENSED
 */
pragma solidity ^0.8.3;

interface Challenger {  
  
  function issue(
    uint64 organizationId,
    uint64 policyId,    
    uint64 actionId,
    uint64 deviceId,
    string calldata deviceToken,
    uint64 challengeId,
    string calldata challengeTitle,
    string calldata challengeMessage
  ) external;
}
