import {IsNotEmpty, ValidateNested} from 'class-validator'
import {AgentId} from '../agent/agent-id'
import {DeviceId} from './device-id'
import {DeviceName} from './device-name'
import {DeviceToken} from './device-token'
import {Timestamp} from '../time/timestamp'
import {validate} from '../domain-validator'

export class Device {
  @IsNotEmpty()
  @ValidateNested()
  id!: DeviceId

  @IsNotEmpty()
  @ValidateNested()
  agentId!: AgentId

  @IsNotEmpty()
  @ValidateNested()
  name!: DeviceName

  @IsNotEmpty()
  @ValidateNested()
  token!: DeviceToken

  @IsNotEmpty()
  @ValidateNested()
  creationDate!: Timestamp

  protected constructor(
    id: DeviceId,
    agentId: AgentId,
    name: DeviceName,
    token: DeviceToken,
    creationDate: Timestamp
  ) {
    this.id = id
    this.agentId = agentId
    this.name = name
    this.token = token
    this.creationDate = creationDate
  }

  static of(
    id: DeviceId,
    agentId: AgentId,
    name: DeviceName,
    token: DeviceToken,
    creationDate: Timestamp
  ): Device {
    return validate(new Device(id, agentId, name, token, creationDate))
  }
}
