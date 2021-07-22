import {IsDefined} from 'class-validator'
import {validate} from '../domain-validator'

export class OrganizationId {
  @IsDefined()
  value!: bigint

  private constructor(value: bigint) {
    this.value = value
  }

  static of(value: bigint): OrganizationId {
    return validate(new OrganizationId(value))
  }
}
