/*
 * Copyright 2021 5DS.io, all rights reserved.
 *
 *  SPDX-License-Identifier: UNLICENSED
 */
pragma solidity ^0.8.3;

interface Organizations {

  function add(address organization) external;

  function get(uint64 organizationId) external view returns (address);  

  function remove(uint64 organizationId) external;

  function lastOrganizationId() external view returns (uint64);
}
