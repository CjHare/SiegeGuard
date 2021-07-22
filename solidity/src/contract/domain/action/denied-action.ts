import {IsNotEmpty, ValidateNested} from 'class-validator'
import {Action} from './action'
import {ActionId} from './/action-id'
import {ChallengeId} from '../challenge/challenge-id'
import {PolicyId} from '../policy/policy-id'
import {Timestamp} from '../time/timestamp'
import {validate} from '../domain-validator'

export class DeniedAction extends Action {
  @IsNotEmpty()
  @ValidateNested()
  deniedDate!: Timestamp

  private constructor(
    id: ActionId,
    policyId: PolicyId,
    authorizedChallenges: ChallengeId[],
    deniedChallenges: ChallengeId[],
    pendingChallenges: ChallengeId[],
    requestDate: Timestamp,
    deniedDate: Timestamp
  ) {
    super()
    this.id = id
    this.policyId = policyId
    this.authorizedChallenges = authorizedChallenges
    this.deniedChallenges = deniedChallenges
    this.pendingChallenges = pendingChallenges
    this.requestDate = requestDate
    this.deniedDate = deniedDate
  }

  static of(
    id: ActionId,
    policyId: PolicyId,
    authorizedChallenges: ChallengeId[],
    deniedChallenges: ChallengeId[],
    pendingChallenges: ChallengeId[],
    requestDate: Timestamp,
    deniedDate: Timestamp
  ): DeniedAction {
    return validate(
      new DeniedAction(
        id,
        policyId,
        authorizedChallenges,
        deniedChallenges,
        pendingChallenges,
        requestDate,
        deniedDate
      )
    )
  }
}
