import {IsNotEmpty, IsString} from 'class-validator'
import {validate} from '../domain-validator'

export class ObsoleteDeviceReason {
  @IsNotEmpty()
  @IsString()
  value!: string

  private constructor(value: string) {
    this.value = value
  }

  static of(value: string): ObsoleteDeviceReason {
    return validate(new ObsoleteDeviceReason(value))
  }
}
