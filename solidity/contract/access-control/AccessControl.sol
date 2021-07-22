/*
 * Copyright 2021 5DS.io, all rights reserved.
 *
 *  SPDX-License-Identifier: UNLICENSED
 */
pragma solidity ^0.8.3;

enum Role {UNINITIALIZED, OWNER, ADMIN, USER}

interface AccessControl {  

  function requiresRole(address entity, Role requirement) external view;
}
