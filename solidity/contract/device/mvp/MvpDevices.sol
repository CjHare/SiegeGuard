/*
 * Copyright 2021 5DS.io, all rights reserved.
 *
 *  SPDX-License-Identifier: UNLICENSED
 */
pragma solidity ^0.8.3;

import '../Devices.sol';
import '../../access-control/AccessControlled.sol';
import '../../validator/InputValidator.sol';

contract MvpDevices is Devices, AccessControlled, InputValidator {

  uint64 private _deviceIdPool;
  mapping(uint64 => Device) private _devices;
  mapping(uint64 => ObsoleteDevice) private _obsoleteDevices;
  mapping(uint64 => uint64[]) private _agentsDevices;

  constructor(address accessControl) AccessControlled(accessControl) {
    _deviceIdPool = 1;
  }  

  function agentDevices(uint64 agentId) external override view returns (Device[] memory){
    senderRequires(Role.USER);     
    validateAgentId(agentId);

    uint64[] storage deviceIds = _agentsDevices[agentId];

    Device[] memory devices = new Device[](deviceIds.length);
    for(uint i = 0; i < deviceIds.length; i++){
      devices[i] = _devices[deviceIds[i]];
    }

    return devices;
  }

  function create(uint64 agentId, string calldata deviceName, string calldata token) external returns (uint64) {
    senderRequires(Role.ADMIN);     
    validateAgentId(agentId);
    validateDeviceName(deviceName);
    validateDeviceToken(token);

    Device storage creation = _devices[_deviceIdPool];
    creation.deviceId = _deviceIdPool;
    creation.agentId = agentId;
    creation.deviceName = deviceName;
    creation.token = token;
    creation.creationDate = block.timestamp;    

    _deviceIdPool++;

    addAgentDevice(creation);

    emit createdDevice(creation);

    return creation.deviceId;
  }

  /**
   * Device Ids are assigned sequentially starting at one. 
   * The set of Device Ids are one to count inclusively.
   * Any Device Id not returning a Device means that Device have been obsolete.
   * Any ObsoleteDevice Id not returning an Obosolete Device means it has been remove from storage (deleted).
   */
  function lastDeviceId() external view returns (uint64) {
    senderRequires(Role.USER);  

    return _deviceIdPool-1;
  }

  function get(uint64 deviceId) external view returns (Device memory) {
    senderRequires(Role.USER);  
    validateDeviceId(deviceId);

    return _devices[deviceId];
  }

  function getObsolete(uint64 deviceId) external view returns (ObsoleteDevice memory) {
    senderRequires(Role.USER);  
    validateDeviceId(deviceId);

    return _obsoleteDevices[deviceId];
  }

  function obsolete(uint64 deviceId, string calldata obsoleteReason) external {
    senderRequires(Role.ADMIN);  
    validateDeviceId(deviceId);
    validateObsoleteReason(obsoleteReason);

    Device memory removing = _devices[deviceId];
    validateDevice(removing);

    ObsoleteDevice storage creation = _obsoleteDevices[deviceId];
    creation.deviceId = removing.deviceId;
    creation.agentId = removing.agentId;
    creation.deviceName = removing.deviceName;
    creation.token = removing.token;
    creation.creationDate = removing.creationDate;
    creation.obsoleteDate = block.timestamp;    
    creation.obsoleteReason = obsoleteReason;

    emit createdObsoleteDevice(creation);

    removeAgentDevice(removing);
    delete _devices[deviceId];           
  }

  function removeObsolete(uint64 deviceId) external {
    senderRequires(Role.ADMIN);  
    validateDeviceId(deviceId);

    delete _obsoleteDevices[deviceId];           
  }

  function removeAgentDevice(Device memory device) private {
    uint64[] storage devices =  _agentsDevices[device.agentId];

    for(uint i = 0; i < devices.length; i++){
      if(devices[i] == device.deviceId){
        delete devices[i];
      }
    }
  }  

  function addAgentDevice(Device storage device) private {
    uint64[] storage devices =  _agentsDevices[device.agentId];

    // Seek an empty index to insert into 
    for(uint i = 0; i < devices.length; i++){
      if(devices[i] == 0){
        devices[i] = device.deviceId;
        return;
      }
    }

    // Otherwise add onto the end
    _agentsDevices[device.agentId].push(device.deviceId);      
  }    

  function validateDevice(Device memory device) private pure{
    validateDeviceId(device.deviceId);
  } 
}
