import {IsDefined} from 'class-validator'
import {validate} from '../domain-validator'

export class Timestamp {
  /** Time since epoch in seconds (not milliseconds) */
  @IsDefined()
  value!: bigint

  private constructor(value: bigint) {
    this.value = value
  }

  static of(value: bigint): Timestamp {
    return validate(new Timestamp(value))
  }
}
