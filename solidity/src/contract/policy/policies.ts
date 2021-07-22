import {ActionId} from '../domain/action/action-id'
import {ChallengeId} from '../domain/challenge/challenge-id'
import {ContractInteractionException} from '../../exception/contract-interaction-exception'
import {EthereumAddress} from '../../web3/domain/ethereum-address'
import {FifthDimensionSecurityWeb3} from '../../web3/fifth-dimension-security-web3'
import {OrganizationId} from '../domain/organization/organization-id'
import {PolicyId} from '../domain/policy/policy-id'

import {SolidityContract} from '../../fifth-dimension-security/solidity-contract'

export class Policies extends SolidityContract {
  private sender: EthereumAddress

  constructor(
    web3: FifthDimensionSecurityWeb3,
    funded: EthereumAddress,
    contract: EthereumAddress
  ) {
    super(web3, contract, Policies.name)
    this.sender = funded
  }

  public async authorize(policy: PolicyId): Promise<void> {
    return this.sendOneArgument(
      'authorize',
      this.sender,
      policy,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      (_: Record<string, unknown>) => {
        this.logContract('authorize on Policy', {id: policy.value})
      }
    )
  }

  public async challengeResponse(
    policy: PolicyId,
    pending: ActionId,
    challenge: ChallengeId,
    approval: boolean
  ): Promise<void> {
    return this.sendThreeArguments(
      'challengeResponse',
      this.sender,
      pending.value,
      challenge.value,
      approval,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      (_: Record<string, unknown>) => {
        this.logContract('processed challenge response', {
          policyId: policy.value,
          actionId: pending.value,
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

  public async add(
    uninitializedPolicy: EthereumAddress,
    organization: OrganizationId
  ): Promise<void> {
    return this.sendTwoArguments(
      'add',
      this.sender,
      uninitializedPolicy.value,
      organization.value,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      (_: Record<string, unknown>) => {
        this.logContract('added and initialized Policy', {
          address: uninitializedPolicy.value,
          organizationId: organization.value
        })
      }
    )
  }

  public async get(id: PolicyId): Promise<EthereumAddress> {
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
        `${Policies.name} get () failed to retrun a value.`
      )
    }

    return address
  }

  public async remove(id: PolicyId): Promise<void> {
    return this.sendOneArgument(
      'add',
      this.sender,
      id.value,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      (_: Record<string, unknown>) => {
        this.logContract('removed', {id: id.value})
      }
    )
  }

  public async lastOrganizationId(): Promise<PolicyId> {
    let last: PolicyId | undefined

    await this.call('lastPolicyId', this.sender, (receipt: string) => {
      last = PolicyId.of(BigInt(receipt))
    }).catch((error: Error) => {
      throw error
    })

    if (last === undefined) {
      throw new ContractInteractionException(
        `${Policies.name} lastPolicyId () failed to retrun a value.`
      )
    }

    return last
  }

  public async destroy(): Promise<void> {
    return super.destroy(this.sender)
  }
}
