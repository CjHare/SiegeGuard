/*
 * Copyright 2021 5DS.io, all rights reserved.
 *
 *  SPDX-License-Identifier: UNLICENSED
 */
pragma solidity ^0.8.3;

struct Agent {
  uint64 id;
  string name;
  string username;
  uint256 creationDate;
}

interface Agents {

  event createdAgent(
    Agent agent
  );  
}
