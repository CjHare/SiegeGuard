import {IsNotEmpty, IsString} from 'class-validator'
import {validate} from '../domain-validator'

export class AgentUsername {
  @IsNotEmpty()
  @IsString()
  value!: string

  private constructor(value: string) {
    this.value = value
  }

  static of(value: string): AgentUsername {
    return validate(new AgentUsername(value))
  }
}
