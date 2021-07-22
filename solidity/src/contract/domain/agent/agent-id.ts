import {IsDefined} from 'class-validator'
import {validate} from '../domain-validator'

export class AgentId {
  @IsDefined()
  value!: bigint

  private constructor(value: bigint) {
    this.value = value
  }

  static of(value: bigint): AgentId {
    return validate(new AgentId(value))
  }
}
