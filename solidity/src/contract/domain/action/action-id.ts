import {IsDefined} from 'class-validator'
import {validate} from '../domain-validator'

export class ActionId {
  @IsDefined()
  value!: bigint

  private constructor(value: bigint) {
    this.value = value
  }

  static of(value: bigint): ActionId {
    return validate(new ActionId(value))
  }
}
