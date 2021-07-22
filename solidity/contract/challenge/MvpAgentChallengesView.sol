/*
 * Copyright 2021 5DS.io, all rights reserved.
 *
 *  SPDX-License-Identifier: UNLICENSED
 */
pragma solidity ^0.8.3;

import '../view/AgentChallengesView.sol';
import '../validator/InputValidator.sol';
import '../access-control/AccessControlled.sol';

/**
 * Provides a view of an Agent's Challenges.
 */
abstract contract MvpAgentChallengesView is AgentChallengesView, AccessControlled, InputValidator {  

//TODO replace these with ordered, single linked list, using merge sort to insert and search

  mapping(uint64 => uint64[]) private _authorizedChallengeIds;
  mapping(uint64 => uint64[]) private _deniedChallengeIds;
  mapping(uint64 => uint64[]) private _pendingChallengeIds;


//TODO move into separate contract (i.e. not abstract, give on Challenges & Agents constructors)

  function pendingChallengeForAgent(uint64 agentId, uint64 challengeId) internal {
    senderRequires(Role.ADMIN);  
    validateAgentId(agentId);
    validateChallengeId(challengeId);  

      //TODO insert into first space      
    _pendingChallengeIds[agentId].push(challengeId);
  }

  function authorizedChallengeForAgent(uint64 agentId, uint64 challengeId) internal {
    senderRequires(Role.ADMIN);  
    validateAgentId(agentId);
    validateChallengeId(challengeId);  

    uint64[] storage pending = _pendingChallengeIds[agentId];

    for(uint i =0; i < pending.length; i++){
      if(pending[i] == challengeId){
        delete pending[i];
      }
    }

      //TODO insert into first space
    _authorizedChallengeIds[agentId].push(challengeId);
  }

  function deniedChallengeForAgent(uint64 agentId, uint64 challengeId) internal {
    senderRequires(Role.ADMIN);  
    validateAgentId(agentId);
    validateChallengeId(challengeId);  
    
    uint64[] storage pending = _pendingChallengeIds[agentId];

    for(uint i =0; i < pending.length; i++){
      if(pending[i] == challengeId){
        delete pending[i];
      }
    }

      //TODO insert into first space
    _deniedChallengeIds[agentId].push(challengeId);
  }

  function removeChallengeForAgent(uint64 agentId, uint64 challengeId) internal view {
    senderRequires(Role.ADMIN);  
    validateAgentId(agentId);
    validateChallengeId(challengeId);    

    //TODO remove from all
  }

  function authorizedChallengeIdsForAgent(uint64 agentId) external override view returns (uint64[] memory challenges){
    senderRequires(Role.USER);  
    validateAgentId(agentId);

    return _authorizedChallengeIds[agentId];
  }

  function deniedChallengeIdsForAgent(uint64 agentId) external override view returns (uint64[] memory challenges) {
    senderRequires(Role.USER);  
    validateAgentId(agentId);

    return _deniedChallengeIds[agentId];
  }

  function pendingChallengeIdsForAgent(uint64 agentId) external override view returns (uint64[] memory challengeIds) {
    senderRequires(Role.USER);  
    validateAgentId(agentId);

    return _pendingChallengeIds[agentId];
  }
}
