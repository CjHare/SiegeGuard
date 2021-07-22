import {IsDefined} from 'class-validator'
import {validate} from '../domain-validator'

export class PolicyId {
  @IsDefined()
  value!: bigint

  private constructor(value: bigint) {
    this.value = value
  }

  static of(value: bigint): PolicyId {
    return validate(new PolicyId(value))
  }
}
