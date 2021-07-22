import {IsDefined} from 'class-validator'
import {validate} from '../domain-validator'

export class ChallengeId {
  @IsDefined()
  value!: bigint

  private constructor(value: bigint) {
    this.value = value
  }

  static of(value: bigint): ChallengeId {
    return validate(new ChallengeId(value))
  }
}
