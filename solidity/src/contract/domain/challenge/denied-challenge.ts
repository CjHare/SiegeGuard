import {IsNotEmpty, ValidateNested} from 'class-validator'
import {ActionId} from '../action/action-id'
import {Challenge} from './challenge'
import {AgentId} from '../agent/agent-id'
import {ChallengeId} from './challenge-id'
import {ChallengeTitle} from './challenge-title'
import {ChallengeMessage} from './challenge-message'
import {DeviceId} from '../device/device-id'
import {DeviceToken} from '../device/device-token'
import {PolicyId} from '../policy/policy-id'
import {Timestamp} from '../time/timestamp'
import {validate} from '../domain-validator'

export class DeniedChallenge extends Challenge {
  @IsNotEmpty()
  @ValidateNested()
  deniedDate!: Timestamp

  private constructor(
    policyId: PolicyId,
    actionId: ActionId,
    agentId: AgentId,
    deviceId: DeviceId,
    deviceToken: DeviceToken,
    challengeId: ChallengeId,
    title: ChallengeTitle,
    message: ChallengeMessage,
    emitDate: Timestamp,
    deniedDate: Timestamp
  ) {
    super()
    this.actionId = actionId
    this.agentId = agentId
    this.policyId = policyId
    this.deviceId = deviceId
    this.deviceToken = deviceToken
    this.challengeId = challengeId
    this.title = title
    this.message = message
    this.emitDate = emitDate
    this.deniedDate = deniedDate
  }

  static of(
    policyId: PolicyId,
    actionId: ActionId,
    agentId: AgentId,
    deviceId: DeviceId,
    deviceToken: DeviceToken,
    challengeId: ChallengeId,
    title: ChallengeTitle,
    message: ChallengeMessage,
    emitDate: Timestamp,
    deniedDate: Timestamp
  ): DeniedChallenge {
    return validate(
      new DeniedChallenge(
        policyId,
        actionId,
        agentId,
        deviceId,
        deviceToken,
        challengeId,
        title,
        message,
        emitDate,
        deniedDate
      )
    )
  }
}
