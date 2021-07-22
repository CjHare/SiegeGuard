import {IsNotEmpty, IsString} from 'class-validator'
import {validate} from '../domain-validator'

export class AgentName {
  @IsNotEmpty()
  @IsString()
  value!: string

  private constructor(value: string) {
    this.value = value
  }

  static of(value: string): AgentName {
    return validate(new AgentName(value))
  }
}
