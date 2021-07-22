/*
 * Copyright 2021 5DS.io, all rights reserved.
 *
 *  SPDX-License-Identifier: UNLICENSED
 */
pragma solidity ^0.8.3;

interface Policy {

  /** 
   * Once off initialization, part of the two stage initialization required before Policy use.
   */
  function init(uint64 organizationId, uint64 policyId) external;

  /** 
   * Once off initialization, part of the two stage initialization required before Policy use.
   */
  function initChallenge(      
      string memory challengeTitle, 
      string memory challengeMessage, 
      uint64[] memory approverAgentIds, 
      uint8 approvalsRequired,
      uint256 timeoutSeconds) external;

  /**
   * Begins a new journey on the authorization path provided by the Policy.
   */
  function startAuthorization() external;

  /**
   * Updates the state of a Policy instance with an Agent's response to a challenge initiated by the Policy instance.
   */
  function challengeResponse(uint64 pendingActionId, uint64 challengeId, bool approval) external;

  function tick() external;
}