import {IsNotEmpty, IsString} from 'class-validator'
import {validate} from '../domain-validator'

export class DeviceToken {
  @IsNotEmpty()
  @IsString()
  value!: string

  private constructor(value: string) {
    this.value = value
  }

  static of(value: string): DeviceToken {
    return validate(new DeviceToken(value))
  }
}
