import {IsNotEmpty, ValidateNested} from 'class-validator'
import {ActionId} from '../action/action-id'
import {AgentId} from '../agent/agent-id'
import {ChallengeId} from './challenge-id'
import {ChallengeTitle} from './challenge-title'
import {ChallengeMessage} from './challenge-message'
import {DeviceId} from '../device/device-id'
import {DeviceToken} from '../device/device-token'
import {PolicyId} from '../policy/policy-id'
import {Timestamp} from '../time/timestamp'

export abstract class Challenge {
  @IsNotEmpty()
  @ValidateNested()
  actionId!: ActionId

  @IsNotEmpty()
  @ValidateNested()
  agentId!: AgentId

  @IsNotEmpty()
  @ValidateNested()
  policyId!: PolicyId

  @IsNotEmpty()
  @ValidateNested()
  deviceId!: DeviceId

  @IsNotEmpty()
  @ValidateNested()
  deviceToken!: DeviceToken

  @IsNotEmpty()
  @ValidateNested()
  challengeId!: ChallengeId

  @IsNotEmpty()
  @ValidateNested()
  title!: ChallengeTitle

  @IsNotEmpty()
  @ValidateNested()
  message!: ChallengeMessage

  @IsNotEmpty()
  @ValidateNested()
  emitDate!: Timestamp
}
