import {IsNotEmpty, ValidateNested} from 'class-validator'
import {AgentId} from './agent-id'
import {AgentName} from './agent-name'
import {AgentUsername} from './agent-username'
import {Timestamp} from '../time/timestamp'
import {validate} from '../domain-validator'

export class Agent {
  @IsNotEmpty()
  @ValidateNested()
  id!: AgentId

  @IsNotEmpty()
  @ValidateNested()
  name!: AgentName

  @IsNotEmpty()
  @ValidateNested()
  username!: AgentUsername

  @IsNotEmpty()
  @ValidateNested()
  creationDate!: Timestamp

  private constructor(
    id: AgentId,
    name: AgentName,
    username: AgentUsername,
    creationDate: Timestamp
  ) {
    this.id = id
    this.name = name
    this.username = username
    this.creationDate = creationDate
  }

  static of(
    id: AgentId,
    name: AgentName,
    username: AgentUsername,
    creationDate: Timestamp
  ): Agent {
    return validate(new Agent(id, name, username, creationDate))
  }
}
