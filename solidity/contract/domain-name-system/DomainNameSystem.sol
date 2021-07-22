/*
 * Copyright 2021 5DS.io, all rights reserved.
 *
 *  SPDX-License-Identifier: UNLICENSED
 */
pragma solidity ^0.8.3;

import '../access-control/AccessControlled.sol';

struct DomainName {
  string value;
}

/**
 * Namespace to Ethereum address mapping.
 */
contract DomainNameSystem is AccessControlled {

  mapping(string => address) private _name;

  constructor(address accessControl) AccessControlled(accessControl) {
  }

  function update(DomainName calldata domain, address location) external {
    senderRequires(Role.OWNER);     
    validateDomainName(domain);
    _name[domain.value] = location;
  }

  function lookup(DomainName calldata domain) external view returns (address) {
    senderRequires(Role.USER);     
    validateDomainName(domain);
    return _name[domain.value];
  }

  function validateDomainName(DomainName calldata domain) private pure {
    require(
      bytes(domain.value).length > 0,
      'DomainName.value is uninitialized'
    );
  }
}
