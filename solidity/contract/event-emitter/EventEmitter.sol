/*
 * Copyright 2021 5DS.io, all rights reserved.
 *
 *  SPDX-License-Identifier: UNLICENSED
 */
pragma solidity ^0.8.3;

// solc EventEmitter.sol --bin --abi --optimize --overwrite -o .

/**
 * Test contract for emitting events from the blockchain.
 */
contract EventEmitter {
  event stored(address _to, uint256 _amount);

  address private _owner;
  address private _sender;
  uint256 private _value;

  constructor() {
    _owner = msg.sender;
  }

  function store(uint256 amount) external {
    emit stored(msg.sender, amount);
    _value = amount;
    _sender = msg.sender;
  }

  function value() external view returns (uint256) {
    return _value;
  }

  function sender() external view returns (address) {
    return _sender;
  }
}
