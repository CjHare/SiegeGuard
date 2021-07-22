import {IsDefined} from 'class-validator'
import {validate} from '../domain-validator'

export class DeviceId {
  @IsDefined()
  value!: bigint

  private constructor(value: bigint) {
    this.value = value
  }

  static of(value: bigint): DeviceId {
    return validate(new DeviceId(value))
  }
}
