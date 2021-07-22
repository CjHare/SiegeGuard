import {IsNotEmpty, ValidateNested} from 'class-validator'
import {ActionId} from '../action/action-id'
import {ChallengeId} from '../challenge/challenge-id'
import {PolicyId} from '../policy/policy-id'
import {Timestamp} from '../time/timestamp'

export abstract class Action {
  @IsNotEmpty()
  @ValidateNested()
  id!: ActionId

  @IsNotEmpty()
  @ValidateNested()
  policyId!: PolicyId

  @IsNotEmpty()
  @ValidateNested()
  authorizedChallenges!: ChallengeId[]

  @IsNotEmpty()
  @ValidateNested()
  deniedChallenges!: ChallengeId[]

  @IsNotEmpty()
  @ValidateNested()
  pendingChallenges!: ChallengeId[]

  @IsNotEmpty()
  @ValidateNested()
  requestDate!: Timestamp
}
