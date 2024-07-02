import {ActionId} from '../domain/action/action-id'
import {ChallengeId} from '../domain/challenge/challenge-id'
import {ContractInteractionException} from '../../exception/contract-interaction-exception'
import {OrganizationId} from '../domain/organization/organization-id'
import {EthereumAddress} from '../../web3/domain/ethereum-address'
import {FifthDimensionSecurityWeb3} from '../../web3/fifth-dimension-security-web3'
import {PolicyId} from '../domain/policy/policy-id'
import {SolidityContract} from '../../fifth-dimension-security/solidity-contract'

export class Organization extends SolidityContract {
  private sender: EthereumAddress

  constructor(
    web3: FifthDimensionSecurityWeb3,
    funded: EthereumAddress,
    contract: EthereumAddress
  ) {
    super(web3, contract, Organization.name)
    this.sender = funded
  }

  public async init(id: OrganizationId): Promise<void> {
    return this.sendOneArgument(
      'init',
      this.sender,
      id.value,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      (_: Record<string, unknown>) => {
        this.logContract('has init', {id: id.value})
      }
    )
  }

  public async addPolicy(unitializedPolicy: EthereumAddress): Promise<void> {
    return this.sendOneArgument(
      'addPolicy',
      this.sender,
      unitializedPolicy.value,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      (_: Record<string, unknown>) => {
        this.logContract('added Policy @ ', {address: unitializedPolicy.value})
      }
    )
  }

  public async startAuthorization(id: PolicyId): Promise<void> {
    return this.sendOneArgument(
      'startAuthorization',
      this.sender,
      id.value,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      (_: Record<string, unknown>) => {
        this.logContract('authorized Policy', {id: id.value})
      }
    )
  }

  public async challengeResponse(
    policy: PolicyId,
    pending: ActionId,
    challenge: ChallengeId,
    approval: boolean
  ): Promise<void> {
    return this.sendFourArguments(
      'challengeResponse',
      this.sender,
      policy.value,
      pending.value,
      challenge.value,
      approval,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      (_: Record<string, unknown>) => {
        this.logContract('processed challenge response #', {
          actionId: pending.value,
          policyId: policy.value,
          challengeId: challenge.value,
          approval: approval
        })
      }
    )
  }

  public async tick(): Promise<void> {
    return this.send(
      'tick',
      this.sender,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      (_: Record<string, unknown>) => {
        this.logContract('ticked')
      }
    )
  }

  public async getOrganizationId(): Promise<OrganizationId> {
    let id: OrganizationId | undefined

    await this.call('getOrganizationId', this.sender, (receipt: string) => {
      id = OrganizationId.of(BigInt(receipt))
    }).catch((error: Error) => {
      throw error
    })

    if (id === undefined) {
      throw new ContractInteractionException(
        `${Organization.name} getOrganizationId () failed to retrun a value.`
      )
    }

    return id
  }

  public async getAgentChallengeViewAddress(): Promise<EthereumAddress> {
    let address: EthereumAddress | undefined

    await this.call(
      'agentChallengeViewAddress',
      this.sender,
      (receipt: string) => {
        address = EthereumAddress.of(receipt)
      }
    ).catch((error: Error) => {
      throw error
    })

    if (address === undefined) {
      throw new ContractInteractionException(
        `${Organization.name} agentChallengeViewAddress () failed to retrun a value.`
      )
    }

    return address
  }

  public async getChallengesAddress(): Promise<EthereumAddress> {
    let address: EthereumAddress | undefined

    await this.call('challengesAddress', this.sender, (receipt: string) => {
      address = EthereumAddress.of(receipt)
    }).catch((error: Error) => {
      throw error
    })

    if (address === undefined) {
      throw new ContractInteractionException(
        `${Organization.name} challengesAddress () failed to retrun a value.`
      )
    }

    return address
  }

  public async destroy(): Promise<void> {
    return super.destroy(this.sender)
  }
}
