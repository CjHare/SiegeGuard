/*
 * Copyright 2021 5DS.io, all rights reserved.
 *
 *  SPDX-License-Identifier: UNLICENSED
 */
pragma solidity ^0.8.3;

import '../policy/PolicyDevices.sol';

struct ObsoleteDevice {
  uint64 deviceId;
  uint64 agentId;
  string deviceName;
  string token;
  uint256 creationDate;   
  uint256 obsoleteDate;    
  string obsoleteReason;      
}

interface Devices is PolicyDevices {

  event createdDevice(
    Device device
  );

  event createdObsoleteDevice(
    ObsoleteDevice device
  );
}
