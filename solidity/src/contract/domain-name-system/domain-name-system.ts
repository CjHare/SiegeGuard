import {ContractInteractionException} from '../../exception/contract-interaction-exception'
import {EthereumAddress} from '../../web3/domain/ethereum-address'
import {FifthDimensionSecurityWeb3} from '../../web3/fifth-dimension-security-web3'
import {log} from '../../container'
import {SolidityContract} from '../../fifth-dimension-security/solidity-contract'
import {DomainName} from '../domain/domain-name-system/domain-name'
import {stringify} from '../../fifth-dimension-security/stringify'

const unknownAddress = EthereumAddress.of(
  '0x0000000000000000000000000000000000000000'
)

export class DomainNameSystem extends SolidityContract {
  private sender: EthereumAddress

  constructor(
    web3: FifthDimensionSecurityWeb3,
    funded: EthereumAddress,
    contract: EthereumAddress
  ) {
    super(web3, contract, DomainNameSystem.name)
    this.sender = funded
  }

  public async update(
    domain: DomainName,
    account: EthereumAddress
  ): Promise<void> {
    const methodName = 'update'

    return this.sendTwoArguments(
      methodName,
      this.sender,
      domain,
      account.value,
      (receipt: Record<string, unknown>) => {
        log.info('%s address updated to %s', domain, account.value)
        log.verbose(
          '%s update ( %s, %s ) invoked',
          DomainNameSystem.name,
          domain.value,
          account.value
        )
        log.debug(
          '%s update ( %s, %s ) receipt: %s',
          DomainNameSystem.name,
          domain.value,
          account.value,
          stringify(receipt)
        )
      }
    )
  }

  public async lookup(domain: DomainName): Promise<EthereumAddress> {
    const methodName = 'lookup'
    let address: EthereumAddress | undefined = undefined

    await this.callOneArgument(
      methodName,
      this.sender,
      domain,
      (result: string) => {
        log.debug(
          '%s lookup ( %s ) result: %s',
          DomainNameSystem.name,
          domain.value,
          result
        )
        address = EthereumAddress.of(result)
      }
    ).catch((error: Error) => {
      throw error
    })

    return this.knownAddress(domain, address)
  }

  private knownAddress(
    domain: DomainName,
    address: EthereumAddress | undefined
  ): EthereumAddress {
    const definedAddress = this.definedAddress(domain, address)

    if (definedAddress.value === unknownAddress.value) {
      throw new ContractInteractionException(
        `${domain.value} domain address is unknown`
      )
    }

    return definedAddress
  }

  private definedAddress(
    domain: DomainName,
    address: EthereumAddress | undefined
  ): EthereumAddress {
    if (address === undefined) {
      throw new ContractInteractionException(
        `${domain.value} domain address is undefined`
      )
    }
    return address
  }
}
