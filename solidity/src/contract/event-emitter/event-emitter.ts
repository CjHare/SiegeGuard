import {EthereumAddress} from '../../web3/domain/ethereum-address'
import {FifthDimensionSecurityWeb3} from '../../web3/fifth-dimension-security-web3'
import {log} from '../../container'
import {SolidityContract} from '../../fifth-dimension-security/solidity-contract'

export class EventEmitter extends SolidityContract {
  private sender: EthereumAddress

  constructor(
    web3: FifthDimensionSecurityWeb3,
    funded: EthereumAddress,
    contract: EthereumAddress
  ) {
    super(web3, contract, EventEmitter.name)
    this.sender = funded
  }

  public async set(value: number): Promise<void> {
    const methodName = 'store'

    await this.sendOneArgument(
      methodName,
      this.sender,
      value,
      (receipt: Record<string, unknown>) => {
        log.verbose('%s set value to %s ', EventEmitter.name, value)
        log.debug(
          '%s set value receipt: %s',
          EventEmitter.name,
          JSON.stringify(receipt)
        )
      }
    ).catch((error: Error) => {
      throw error
    })

    this.logSenderAndValue()
  }

  private async logSenderAndValue() {
    await this.call('sender', this.sender, (result: string) =>
      log.verbose('%s sender: %s', EventEmitter.name, result)
    ).catch((error: Error) => {
      log.warn(error)
    })

    await this.call('value', this.sender, (result: string) =>
      log.verbose('%s value: %s', EventEmitter.name, result)
    ).catch((error: Error) => {
      log.warn(error)
    })
  }
}
