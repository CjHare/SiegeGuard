import {IsNotEmpty, IsString} from 'class-validator'
import {validate} from '../domain-validator'

export class ChallengeMessage {
  @IsNotEmpty()
  @IsString()
  value!: string

  private constructor(value: string) {
    this.value = value
  }

  static of(value: string): ChallengeMessage {
    return validate(new ChallengeMessage(value))
  }
}
