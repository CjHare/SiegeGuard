import {IsNotEmpty, IsString} from 'class-validator'
import {validate} from '../domain-validator'

export class ChallengeTitle {
  @IsNotEmpty()
  @IsString()
  value!: string

  private constructor(value: string) {
    this.value = value
  }

  static of(value: string): ChallengeTitle {
    return validate(new ChallengeTitle(value))
  }
}
