/*
 * Copyright 2021 5DS.io, all rights reserved.
 *
 *  SPDX-License-Identifier: UNLICENSED
 */
pragma solidity ^0.8.3;

import '../policy/PolicyActions.sol';

struct AuthorizedAction {
  uint64 id;
  uint64 policyId;
  uint64[] authorizedChallenges;
  uint64[] deniedChallenges;
  uint64[] pendingChallenges;
  uint256 requestDate;
  uint256 authorizedDate;
}

struct DeniedAction {
  uint64 id;
  uint64 policyId;
  uint64[] authorizedChallenges;
  uint64[] deniedChallenges;
  uint64[] pendingChallenges;
  uint256 requestDate;
  uint256 deniedDate;
}

interface Actions is PolicyActions {

  event createdAuthorizedAction(
    AuthorizedAction action
  );
  event createdDeniedAction(
    DeniedAction action
  );  
  event createdPendingAction(
    PendingAction action
  );  
}
