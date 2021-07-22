/*
 * Copyright 2021 5DS.io, all rights reserved.
 *
 *  SPDX-License-Identifier: UNLICENSED
 */
pragma solidity ^0.8.3;

import '../Agents.sol';
import '../../access-control/AccessControlled.sol';
import '../../validator/InputValidator.sol';

contract MvpAgents is Agents, AccessControlled, InputValidator {

  uint64 private _agentIdPool;
  mapping(uint64 => Agent) private _agents;

  constructor(address accessControl) AccessControlled(accessControl) {
    _agentIdPool = 1;
  }

  function create(string calldata name, string calldata username) external returns (Agent memory) {
    senderRequires(Role.ADMIN);     
    validateAgentName(name);
    validateAgentUsername(username);

    Agent storage creation = _agents[_agentIdPool];
    creation.id = _agentIdPool;
    creation.name = name;
    creation.username = username;
    creation.creationDate = block.timestamp;    

    _agentIdPool++;

    emit createdAgent(creation);

    return creation;
  }

  function get(
  uint64 agentId
  ) external view returns (Agent memory) {
    senderRequires(Role.USER);  
    validateAgentId(agentId);

    return _agents[agentId];
  }

  /**
   * Agent Ids are assigned sequentially starting at one. 
   * The set of Agent Ids are one to count inclusively.
   * Any Agent Id not returning an Agent means that Agent have been remove from storage (deleted).
   */
  function lastAgentId() external view returns (uint64) {
    senderRequires(Role.USER);  

    return _agentIdPool-1;
  }

  function remove(uint64 agentId) external {
    senderRequires(Role.ADMIN);  
    validateAgentId(agentId);

    delete _agents[agentId];           
  }
}
