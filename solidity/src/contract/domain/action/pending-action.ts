import {Action} from './action'
import {ActionId} from './/action-id'
import {ChallengeId} from '../challenge/challenge-id'
import {PolicyId} from '../policy/policy-id'
import {Timestamp} from '../time/timestamp'
import {validate} from '../domain-validator'

export class PendingAction extends Action {
  private constructor(
    id: ActionId,
    policyId: PolicyId,
    authorizedChallenges: ChallengeId[],
    deniedChallenges: ChallengeId[],
    pendingChallenges: ChallengeId[],
    requestDate: Timestamp
  ) {
    super()
    this.id = id
    this.policyId = policyId
    this.authorizedChallenges = authorizedChallenges
    this.deniedChallenges = deniedChallenges
    this.pendingChallenges = pendingChallenges
    this.requestDate = requestDate
  }

  static of(
    id: ActionId,
    policyId: PolicyId,
    authorizedChallenges: ChallengeId[],
    deniedChallenges: ChallengeId[],
    pendingChallenges: ChallengeId[],
    requestDate: Timestamp
  ): PendingAction {
    return validate(
      new PendingAction(
        id,
        policyId,
        authorizedChallenges,
        deniedChallenges,
        pendingChallenges,
        requestDate
      )
    )
  }
}
