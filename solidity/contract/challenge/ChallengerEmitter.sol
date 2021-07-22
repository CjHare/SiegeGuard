/*
 * Copyright 2021 5DS.io, all rights reserved.
 *
 *  SPDX-License-Identifier: UNLICENSED
 */
pragma solidity ^0.8.3;

import './Challenger.sol';
import '../access-control/AccessControlled.sol';
import '../validator/InputValidator.sol';

contract ChallengerEmitter is Challenger, AccessControlled, InputValidator {

  event issueChallenge(
    uint64 organizationId,
    uint64 policyId,    
    uint64 actionId,
    uint64 deviceId,
    string deviceToken,
    uint64 challengeId,
    string challengeTitle,
    string challengeMessage
  );

  constructor(address accessControl) AccessControlled(accessControl) {
  }

  function issue(
    uint64 organizationId,
    uint64 policyId,    
    uint64 actionId,
    uint64 deviceId,
    string calldata deviceToken,
    uint64 challengeId,
    string calldata challengeTitle,
    string calldata challengeMessage
  ) override external {
    senderRequires(Role.ADMIN);  
    validateOrganizationId(organizationId);
    validatePolicyId(policyId);
    validateActionId(actionId);
    validateDeviceId(deviceId);
    validateDeviceToken(deviceToken);
    validateChallengeId(challengeId);
    validateChallengeTitle(challengeTitle);
    validateChallengeMessage(challengeMessage);

    emit issueChallenge(
      organizationId, 
      policyId, 
      actionId, 
      deviceId, 
      deviceToken, 
      challengeId, 
      challengeTitle, 
      challengeMessage);          
  }
}
