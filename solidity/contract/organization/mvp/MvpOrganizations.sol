/*
 * Copyright 2021 5DS.io, all rights reserved.
 *
 *  SPDX-License-Identifier: UNLICENSED
 */
pragma solidity ^0.8.3;

import '../Organization.sol';
import '../Organizations.sol';
import '../../access-control/AccessControlled.sol';
import '../../validator/InputValidator.sol';

contract MvpOrganizations is Organizations, AccessControlled, InputValidator {

  uint64 private _organizationIdPool;
  mapping(uint64 => Organization) private _organizations;

  constructor(address accessControl) AccessControlled(accessControl) {  
    _organizationIdPool = 1;
  }

  function add(address organization) external override {
    senderRequires(Role.ADMIN); 
    validateIsAddressNonZero(organization);       

    uint64 id = _organizationIdPool;
    _organizationIdPool++;

    _organizations[id] = Organization(organization);
    _organizations[id].init(id);
  }

  /**
   * Organization Ids are assigned sequentially starting at one. 
   * The set of Organization Ids are one to count inclusively.
   */
  function lastOrganizationId() external override view returns (uint64) {
    senderRequires(Role.USER);  

    return _organizationIdPool-1;
  }  

  function get(uint64 organizationId) external override view returns (address) {
    senderRequires(Role.USER);       
    validateOrganizationId(organizationId);

    return address(_organizations[organizationId]);
  } 

  function remove(uint64 organizationId) external override {
    senderRequires(Role.ADMIN);       
    validateOrganizationId(organizationId);
    validateOrganizationExists(organizationId);

    delete _organizations[organizationId];
  } 

   function validateOrganizationExists(uint64 organizationId) private view {
    require(address(_organizations[organizationId]) == address(0), 'OrganizationId not found amongst current organization set');
  }   
}