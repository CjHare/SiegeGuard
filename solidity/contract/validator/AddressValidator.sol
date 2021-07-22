/*
 * Copyright 2021 5DS.io, all rights reserved.
 *
 *  SPDX-License-Identifier: UNLICENSED
 */
pragma solidity ^0.8.3;

contract AddressValidator {

  function validateIsAddressNonZero(address potentiallyZero) internal pure {
    require(potentiallyZero != address(0), 'Unitialized address');
  }
}
