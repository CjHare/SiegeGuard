import {EthereumAddress} from '../../web3/domain/ethereum-address'
import {FifthDimensionSecurityWeb3} from '../../web3/fifth-dimension-security-web3'
import {SolidityContract} from '../../fifth-dimension-security/solidity-contract'
import {ContractInteractionException} from '../../exception/contract-interaction-exception'

enum Role {
  UNINITIALIZED,
  OWNER,
  ADMIN,
  USER
}

export class AccessControl extends SolidityContract {
  private sender: EthereumAddress

  constructor(
    web3: FifthDimensionSecurityWeb3,
    funded: EthereumAddress,
    contract: EthereumAddress
  ) {
    super(web3, contract, AccessControl.name)
    this.sender = funded
  }

  public async addOwner(owner: EthereumAddress): Promise<void> {
    return this.sendOneArgument('addOwner', this.sender, owner.value, () => {
      this.logContract('added owner', {address: owner.value})
    })
  }

  public async addAdmin(admin: EthereumAddress): Promise<void> {
    return this.sendOneArgument('addAdmin', this.sender, admin.value, () => {
      this.logContract('added admin', {address: admin.value})
    })
  }

  public async addUser(user: EthereumAddress): Promise<void> {
    return this.sendOneArgument('addUser', this.sender, user.value, () => {
      this.logContract('added user', {address: user.value})
    })
  }

  public async getOwners(): Promise<EthereumAddress[]> {
    return this.getAddresses('getOwners')
  }

  public async getAdmins(): Promise<EthereumAddress[]> {
    return this.getAddresses('getAdmins')
  }

  public async getUsers(): Promise<EthereumAddress[]> {
    return this.getAddresses('getUsers')
  }

  public async removeOwner(owner: EthereumAddress): Promise<void> {
    return this.sendOneArgument('removeOwner', this.sender, owner.value, () => {
      this.logContract('removed owner', {address: owner.value})
    })
  }

  public async removeAdmin(admin: EthereumAddress): Promise<void> {
    return this.sendOneArgument('removeAdmin', this.sender, admin.value, () => {
      this.logContract('removed admin', {address: admin.value})
    })
  }

  public async removeUser(user: EthereumAddress): Promise<void> {
    return this.sendOneArgument('removeUser', this.sender, user.value, () => {
      this.logContract('removed user', {address: user.value})
    })
  }

  public async senderRequires(requirement: Role): Promise<void> {
    await this.callOneArgument(
      'senderRequires',
      this.sender,
      requirement,
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      () => {}
    ).catch((error: Error) => {
      throw error
    })
  }

  private async getAddresses(method: string): Promise<EthereumAddress[]> {
    let addresses: EthereumAddress[] | undefined

    await this.call(method, this.sender, (receipt: string[]) => {
      addresses = this.convertToEthereumAddresses(receipt)
    }).catch((error: Error) => {
      throw error
    })

    if (addresses === undefined) {
      throw new ContractInteractionException(
        `${AccessControl.name} ${method} () failed to retrun a value`
      )
    }

    return addresses
  }

  private convertToEthereumAddresses(addresses: string[]): EthereumAddress[] {
    const converts = new Array(addresses.length)

    for (let i = 0; i < converts.length; i++) {
      converts[i] = EthereumAddress.of(addresses[i])
    }

    return converts
  }
}
