/*
 * Copyright 2021 5DS.io, all rights reserved.
 *
 *  SPDX-License-Identifier: UNLICENSED
 */
pragma solidity ^0.8.3;

import './AccessControl.sol';

/**
 * Management of Owners, Admins and Users for function modifiers (access control by Ethereum address).
 * Owner > Admin > User
 */
contract HierarchicalAccessControl is AccessControl {  
  
  mapping (address => uint256) private _ownerIndex;
  mapping (address => uint256) private _adminIndex;
  mapping (address => uint256) private _userIndex;
  address[] private _owners;
  address[] private _admins;
  address[] private _users;

  constructor() {

    // Reserving index zero for entity not present
    address dummy = address(0);
    _owners.push(dummy);
    _admins.push(dummy);
    _users.push(dummy);

    _owners.push(msg.sender);
    _ownerIndex[msg.sender]=_owners.length-1;
  }

  function requiresRole(address entity, Role requirement) public override view {
    if (requirement == Role.OWNER) {
      require(_ownerIndex[entity] > 0, permissionErrorMessage(entity, 'Owner'));
    }
    else if(requirement == Role.ADMIN) {
      require(_ownerIndex[entity] > 0 || _adminIndex[entity] > 0, permissionErrorMessage(entity, 'Admin'));
    }
    else if(requirement == Role.USER) {
      require(_ownerIndex[entity] > 0 || _adminIndex[entity] > 0 || _userIndex[entity] > 0, permissionErrorMessage(entity, 'User'));
    }
    else{
      revert("Unepected Role");
    }
  }

  function addOwner(address owner) external {
    requiresRole(msg.sender, Role.OWNER);
    absentFromOwners(owner);
    absentFromAdmins(owner);
    absentFromUsers(owner);

    _owners.push(owner);
    _ownerIndex[owner]=_owners.length-1;
  }

  function getOwners() external view returns (address[] memory) {
    requiresRole(msg.sender, Role.OWNER);

    return _owners;
  }

  function removeOwner(address owner) external {
    requiresRole(msg.sender, Role.OWNER);    
    minimumOwnerPopulationIfRemoved(owner);

    delete _owners[_ownerIndex[owner]];
    delete _ownerIndex[owner];
  }

  function addAdmin(address admin) external {
    requiresRole(msg.sender, Role.ADMIN);    
    absentFromOwners(admin);
    absentFromAdmins(admin);
    absentFromUsers(admin);

    _admins.push(admin);
    _adminIndex[admin]=_admins.length-1;    
  }

  function getAdmins() external view returns (address[] memory) {
    requiresRole(msg.sender, Role.ADMIN);  

    return _admins;
  }

  function removeAdmin(address admin) external {
    requiresRole(msg.sender, Role.ADMIN);    
    adminMustExist(admin);

    delete _admins[_adminIndex[admin]];
    delete _adminIndex[admin];
  }

  function addUser(address user) external {
    requiresRole(msg.sender, Role.ADMIN);  
    absentFromOwners(user);
    absentFromAdmins(user);
    absentFromUsers(user);

    _users.push(user);
    _userIndex[user]=_users.length-1;    
  }
  
  function getUsers() external view returns (address[] memory) {
    requiresRole(msg.sender, Role.ADMIN);    

    return _users;
  }  

  function removeUser(address user) external {
    requiresRole(msg.sender, Role.ADMIN);    
    userMustExist(user);

    delete _users[_userIndex[user]];
    delete _userIndex[user];
  }  

  function absentFromOwners(address entity) private view {
    require(_ownerIndex[entity] == 0, "Already present as an owner");
  }

  function absentFromAdmins(address entity) private view {
    require(_adminIndex[entity] == 0, "Already present as an admin");
  }

  function absentFromUsers(address entity) private view {
    require(_userIndex[entity] == 0, "Already present as a user");
  }

  function userMustExist(address user) private view {
    require(_userIndex[user] != 0, "No matching user entry");
  }

  function adminMustExist(address admin) private view {
    require(_adminIndex[admin] != 0, "No matching admin entry");
  }

  function ownerMustExist(address owner) private view {
    require(_ownerIndex[owner] != 0, "No matching owner entry");
  }

  function minimumOwnerPopulationIfRemoved(address removing) private view {
    uint ownerCount = 0;
    address previouslyRemoved = address(0);

    for(uint i=1; i<_owners.length; i++){
      if(_owners[i] != previouslyRemoved || _owners[i] != removing){
        ownerCount++;
      }
    }

    require(ownerCount >= 1, "There must always be at least one owner besides empty accounts");
  }

  function permissionErrorMessage(address entity, string memory requirement) public pure returns(string memory) {
    return string(abi.encodePacked(toHexString(entity),' must have ', requirement, ' permissions'));
  } 

  function toHexString(address account) public pure returns(string memory) {
    bytes memory data = abi.encodePacked(account);
    bytes memory alphabet = "0123456789abcdef";

    bytes memory str = new bytes(2 + data.length * 2);
    str[0] = "0";
    str[1] = "x";
    for (uint i = 0; i < data.length; i++) {
        str[2+i*2] = alphabet[uint(uint8(data[i] >> 4))];
        str[3+i*2] = alphabet[uint(uint8(data[i] & 0x0f))];
    }
    return string(str);
  }
}
