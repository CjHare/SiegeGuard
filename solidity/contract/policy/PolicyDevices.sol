/*
 * Copyright 2021 5DS.io, all rights reserved.
 *
 *  SPDX-License-Identifier: UNLICENSED
 */
pragma solidity ^0.8.3;


struct Device {
  uint64 deviceId;
  uint64 agentId;
  string deviceName;
  string token;
  uint256 creationDate;    
}

interface PolicyDevices {

  function agentDevices(uint64 agentId) external view returns (Device[] memory);
}