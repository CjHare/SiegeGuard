/*
 * Copyright 2021 5DS.io, all rights reserved.
 *
 *  SPDX-License-Identifier: UNLICENSED
 */
pragma solidity ^0.8.3;

/**
 * Double linked list implementation of an ordered set.
 * Only a single instance of a uint64 value is stored, in ascending order.
 */
contract OrderedDoubleLinkedListSet {

  uint64 constant NULL = 0;
  uint64 constant HEAD = 0;
  bool constant PREVIOUS = false;
  bool constant NEXT = true;

  uint private _size = 0;

  // Each unit64 node has two neighbours, PREVIOUS and NEXT.
  mapping (uint64 => mapping (bool => uint64)) private _links;

  function nextNode(uint64 node) internal view returns (uint64) {
    return _links[node][NEXT];
  }

  function previousNode(uint64 node) internal view returns (uint64) {
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

    if(_links[HEAD][NEXT] == NULL){       
      insert(HEAD, node, NEXT);
    }
    else{
      recurse(node, 0, _size);
    }

    _size++;
  }

  /**
   * Insert the node somewhere (inclusive) between the two indexes.
   */
  function recurse(uint64 node, uint startIndex, uint endIndex) internal {
    uint range = endIndex - startIndex;
    uint pivotIndex = startIndex + (range / 2);
    uint64 pivotNode = nodeAt(pivotIndex);

    if(node == pivotNode){
      revert('Node is already present');
    } else if(range < 2){
      // can't recurse as there's no more to divide

      if(pivotNode > node){
        // node is smaller, insert before the pivot
        insert(pivotNode, node, PREVIOUS);
      }else{
        // node is larger, insert after the pivot
        insert(pivotNode, node, NEXT);
      }
    } else{
      if(pivotNode > node){
        // node is smaller :. into the lower half of the range
        recurse(node, startIndex, pivotIndex);
      }else{
        // node is larger :. into the upper half of the range
        recurse(node, pivotIndex, endIndex);
      }
    }
  }

  /**
   * Iterating through the linked list starting from the head (index 0, value 0)
   */
  function nodeAt(uint index) internal view returns (uint64) {
      uint64 node = HEAD;

      for (uint i = 0; i < index; i++) {
        node = nextNode(node);
      }

      return node;
  }

  function step(uint64 node, bool direction) internal view returns (uint64) {
    return _links[node][direction];
  }

  function insert(uint64 existingNode, uint64 newNode, bool direction) internal {
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
