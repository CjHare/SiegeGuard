import {IsNotEmpty, IsString} from 'class-validator'
import {validate} from '../domain-validator'

export class DeviceName {
  @IsNotEmpty()
  @IsString()
  value!: string

  private constructor(value: string) {
    this.value = value
  }

  static of(value: string): DeviceName {
    return validate(new DeviceName(value))
  }
}
