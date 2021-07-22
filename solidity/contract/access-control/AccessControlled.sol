/*
 * Copyright 2021 5DS.io, all rights reserved.
 *
 *  SPDX-License-Identifier: UNLICENSED
 */
pragma solidity ^0.8.3;

import '../access-control/AccessControl.sol';
import '../../validator/AddressValidator.sol';

contract AccessControlled is AddressValidator {
  
  AccessControl private _access; 

  constructor(address accessControl) {
    validateIsAddressNonZero(accessControl);   
    _access = AccessControl(accessControl);
  }    

  function senderRequires(Role requirement) internal view {
    _access.requiresRole(msg.sender, requirement);
  }

 /**
  * Contract self-destruct.
  */
  function destroy() external {
    senderRequires(Role.OWNER);  

    selfdestruct(payable(msg.sender));
  }

  /**
   * Version identifier for the contract.
   */
  function version() external view returns (string memory) {
     senderRequires(Role.USER);

     return "0.0.1";     
  }  
}
