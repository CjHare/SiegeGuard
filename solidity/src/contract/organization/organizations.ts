import {ContractInteractionException} from '../../exception/contract-interaction-exception'
import {EthereumAddress} from '../../web3/domain/ethereum-address'
import {FifthDimensionSecurityWeb3} from '../../web3/fifth-dimension-security-web3'
import {OrganizationId} from '../domain/organization/organization-id'
import {SolidityContract} from '../../fifth-dimension-security/solidity-contract'

export class Organizations extends SolidityContract {
  private sender: EthereumAddress

  constructor(
    web3: FifthDimensionSecurityWeb3,
    funded: EthereumAddress,
    contract: EthereumAddress
  ) {
    super(web3, contract, Organizations.name)
    this.sender = funded
  }

  public async add(organization: EthereumAddress): Promise<void> {
    return this.sendOneArgument(
      'add',
      this.sender,
      organization.value,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      (_: Record<string, unknown>) => {
        this.logContract('added and initialized', {address: organization.value})
      }
    )
  }

  public async lastOrganizationId(): Promise<OrganizationId> {
    let last: OrganizationId | undefined

    await this.call('lastOrganizationId', this.sender, (receipt: string) => {
      last = OrganizationId.of(BigInt(receipt))
    }).catch((error: Error) => {
      throw error
    })

    if (last === undefined) {
      throw new ContractInteractionException(
        `${Organizations.name} lastOrganizationId () failed to retrun a value.`
      )
    }

    return last
  }

  public async get(id: OrganizationId): Promise<EthereumAddress> {
    let address: EthereumAddress | undefined

    await this.callOneArgument(
      'get',
      this.sender,
      id.value,
      (receipt: string) => {
        address = EthereumAddress.of(receipt)
      }
    ).catch((error: Error) => {
      throw error
    })

    if (address === undefined) {
      throw new ContractInteractionException(
        `${Organizations.name} get () failed to retrun a value.`
      )
    }

    return address
  }

  public async remove(organization: OrganizationId): Promise<void> {
    return this.sendOneArgument(
      'remove',
      this.sender,
      organization.value,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      (_: Record<string, unknown>) => {
        this.logContract('removed organization #', {id: organization.value})
      }
    )
  }

  public async destroy(): Promise<void> {
    return super.destroy(this.sender)
  }
}
