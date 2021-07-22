/*
 * Copyright 2021 5DS.io, all rights reserved.
 *
 *  SPDX-License-Identifier: UNLICENSED
 */
pragma solidity ^0.8.3;

//TODO rename - OrderedDoubleLinkedListUInt64
//TODO are generics going to work for the key?
//TODO duplicate values - or a set?

contract DoubleLinkedList {

  uint64 constant NULL = 0;
  uint64 constant HEAD = 0;
  bool constant PREVIOUS = false;
  bool constant NEXT = true;

  uint private _size = 0;

  mapping (uint64 => mapping (bool => uint64)) private _links;

  function nextNodeId(uint64 node) internal view returns (uint64) {
    return _links[node][NEXT];
  }

  function previousNodeId(uint64 node) internal view returns (uint64) {
    return _links[node][PREVIOUS];
  }

  function values() external view returns (uint64[] memory)  {
    uint64[] memory nodes = new uint64[](_size);
    uint i = 0;
    uint64 node = step(HEAD, NEXT);
    while (node != HEAD) {
      nodes[i] = node;
      i++;
      node = step(node, NEXT);
    }

    return nodes;
  }

  function insert(uint64 node) external {

    if(_links[HEAD][NEXT] == NULL ){
      insert(HEAD, node, NEXT);
    }
    else{
      uint64 pivotNode = nodeAt( _size / 2);

      if(node == pivotNode){


      } else if( node > pivotNode){
        
        //node is bigger
      } else {

        //node is smaller
      }
    }

    _size++;
  }

  function nodeAt(uint index) internal view returns (uint64) {

  }

  function step(uint64 node, bool direction) internal view returns (uint64) {
    return _links[node][direction];
  }

  function insert (uint64 existingNode, uint64 newNode, bool direction) internal {
        uint64 neighbour = _links[existingNode][direction];
        stitch (existingNode, newNode, direction);
        stitch (newNode, neighbour, direction);
  }

  function stitch(uint64 a, uint64 b, bool direction) internal {
    _links[b][!direction] = a;
    _links[a][direction] = b;
  }  

  function remove(uint64 node) external {
    if (node == NULL) return;
        
    stitch(_links[node][PREVIOUS], _links[node][NEXT], NEXT);
    delete _links[node][PREVIOUS];
    delete _links[node][NEXT];

    _size--;
    }  
}
