import {IsNotEmpty, ValidateNested} from 'class-validator'
import {Action} from './action'
import {ActionId} from './/action-id'
import {ChallengeId} from '../challenge/challenge-id'
import {PolicyId} from '../policy/policy-id'
import {Timestamp} from '../time/timestamp'
import {validate} from '../domain-validator'

export class AuthorizedAction extends Action {
  @IsNotEmpty()
  @ValidateNested()
  authorizedDate!: Timestamp

  private constructor(
    id: ActionId,
    policyId: PolicyId,
    authorizedChallenges: ChallengeId[],
    deniedChallenges: ChallengeId[],
    pendingChallenges: ChallengeId[],
    requestDate: Timestamp,
    authorizedDate: Timestamp
  ) {
    super()
    this.id = id
    this.policyId = policyId
    this.authorizedChallenges = authorizedChallenges
    this.deniedChallenges = deniedChallenges
    this.pendingChallenges = pendingChallenges
    this.requestDate = requestDate
    this.authorizedDate = authorizedDate
  }

  static of(
    id: ActionId,
    policyId: PolicyId,
    authorizedChallenges: ChallengeId[],
    deniedChallenges: ChallengeId[],
    pendingChallenges: ChallengeId[],
    requestDate: Timestamp,
    authorizedDate: Timestamp
  ): AuthorizedAction {
    return validate(
      new AuthorizedAction(
        id,
        policyId,
        authorizedChallenges,
        deniedChallenges,
        pendingChallenges,
        requestDate,
        authorizedDate
      )
    )
  }
}
