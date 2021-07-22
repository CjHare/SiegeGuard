import {
  IsEthereumAddress,
  IsNotEmpty,
  IsString,
  validateSync
} from 'class-validator'
import {ValidationException} from '../../exception/validation-exception'

/**
 * Can be either a balance holding account or the address of a smart contract.
 */
export class EthereumAddress {
  @IsNotEmpty()
  @IsString()
  @IsEthereumAddress()
  value!: string

  private constructor(address: string) {
    this.value = address
  }

  static of(address: string): EthereumAddress {
    const ethereumAddress = new EthereumAddress(address)
    const errors = validateSync(ethereumAddress)

    if (errors.length > 0) {
      const message = address + ', ' + errors.join(', ')
      throw new ValidationException(message)
    }

    return ethereumAddress
  }
}
