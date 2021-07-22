/*
 * Copyright 2021 5DS.io, all rights reserved.
 *
 *  SPDX-License-Identifier: UNLICENSED
 */
pragma solidity ^0.8.3;

contract InputValidator {

  function validateActionId(uint64 actionId) internal pure {
    require(actionId > 0, 'Uninitialized actionId');
  }
  
  function validateAgentId(uint agentId) internal pure {
    require(agentId > 0, 'Uninitialized agentId');
  }

  function validateAgentUsername(string memory username) internal pure {
    require(bytes(username).length > 0,'Uninitialized Agent Username');
  }

  function validateAgentName(string memory name) internal pure {
    require(bytes(name).length > 0,'Uninitialized Agent Name');
  }  

  function validateChallengeId(uint64 challengeId) internal pure {
    require(challengeId > 0, 'Uninitialized challengeId');
  }  
  
  function validateChallengeTitle(string memory challengeTitle) internal pure {
    require(bytes(challengeTitle).length > 0, 'Uninitialized challengeTitle');
  }
  
  function validateChallengeMessage(string memory challengeMessage) internal pure {
    require(bytes(challengeMessage).length > 0, 'Uninitialized challengeMessage');
  }

  function validateDeviceId(uint64 deviceId) internal pure {
    require(deviceId > 0, 'Uninitialized deviceId');
  }

  function validateDeviceName(string calldata deviceName) internal pure {
    require(bytes(deviceName).length > 0,'Uninitialized deviceName');
  }  

  function validateDeviceToken(string memory deviceToken) internal pure {
    require(bytes(deviceToken).length > 0, 'Uninitialized deviceToken');
  }

  function validateObsoleteDeviceId(uint64 obsoleteDeviceId) internal pure {
    require(obsoleteDeviceId > 0, 'Uninitialized obsoleteDeviceId');
  }
  
  function validateObsoleteReason(string memory obsoleteReason) internal pure {
    require(bytes(obsoleteReason).length > 0,'Uninitialized obsoleteReason');
  }  

  function validateOrganizationId(uint64 organizationId) internal pure {
    require(organizationId > 0, 'Uninitialized organizationId');
  }

  function validatePendingActionId(uint64 pendingActionId) internal pure {
    require(pendingActionId > 0, 'Uninitialized pendingActionId');
  }   

  function validatePolicyId(uint64 policyId) internal pure {
    require(policyId > 0, 'Uninitialized policyId');
  }    

  function validatePolicyTitle(string memory policyTitle) internal pure {
    require(bytes(policyTitle).length > 0, 'Uninitialized policyTitle');
  }  
}
