import {IsNotEmpty, IsString} from 'class-validator'
import {validate} from '../domain-validator'

export class PolicyTitle {
  @IsNotEmpty()
  @IsString()
  value!: string

  private constructor(value: string) {
    this.value = value
  }

  static of(value: string): PolicyTitle {
    return validate(new PolicyTitle(value))
  }
}
