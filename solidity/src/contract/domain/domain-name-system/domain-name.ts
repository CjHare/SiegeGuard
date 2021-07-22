import {IsNotEmpty, IsString} from 'class-validator'
import {validate} from '../domain-validator'

/**
 * Textual name for an address that is paied with an Ethereum account in 5DS DNS.
 */
export class DomainName {
  @IsNotEmpty()
  @IsString()
  value!: string

  private constructor(value: string) {
    this.value = value
  }

  static of(name: string): DomainName {
    return validate(new DomainName(name))
  }
}
