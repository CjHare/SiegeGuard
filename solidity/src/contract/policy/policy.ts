import {ActionId} from '../domain/action/action-id'
import {ChallengeId} from '../domain/challenge/challenge-id'
import {ChallengeTitle} from '../domain/challenge/challenge-title'
import {ChallengeMessage} from '../domain/challenge/challenge-message'
import {OrganizationId} from '../domain/organization/organization-id'
import {EthereumAddress} from '../../web3/domain/ethereum-address'
import {FifthDimensionSecurityWeb3} from '../../web3/fifth-dimension-security-web3'
import {PolicyId} from '../domain/policy/policy-id'
import {SolidityContract} from '../../fifth-dimension-security/solidity-contract'
import {ContractInteractionException} from '../../exception/contract-interaction-exception'

export class Policy extends SolidityContract {
  private sender: EthereumAddress

  constructor(
    web3: FifthDimensionSecurityWeb3,
    funded: EthereumAddress,
    contract: EthereumAddress
  ) {
    super(web3, contract, Policy.name)
    this.sender = funded
  }

  public async init(
    organization: OrganizationId,
    policy: PolicyId
  ): Promise<void> {
    return this.sendTwoArguments(
      'init',
      this.sender,
      organization.value,
      policy.value,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      (_: Record<string, unknown>) => {
        this.logContract('init', {
          policyId: policy.value,
          organizationId: organization.value
        })
      }
    )
  }

  public async initChallenge(
    title: ChallengeTitle,
    message: ChallengeMessage,
    approverAgentIds: bigint[],
    approvalsRequired: number,
    timeoutSeconds: bigint
  ): Promise<void> {
    return this.sendFiveArguments(
      'initChallenge',
      this.sender,
      title.value,
      message.value,
      approverAgentIds,
      approvalsRequired,
      timeoutSeconds,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      (_: Record<string, unknown>) => {
        this.logContract('init challenge', {
          challengeTitle: title.value,
          challengeMessage: message.value,
          approvers: approverAgentIds,
          approvalsRequired: approvalsRequired,
          timeout: timeoutSeconds
        })
      }
    )
  }

  public async startAuthorization(): Promise<void> {
    return this.send(
      'startAuthorization',
      this.sender,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      (_: Record<string, unknown>) => {
        this.logContract('started authorization')
      }
    )
  }

  public async challengeResponse(
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
          challengeId: challenge.value,
          actionId: pending.value,
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

  public async getPolicyId(): Promise<PolicyId> {
    let id: PolicyId | undefined

    await this.call('getPolicyId', this.sender, (receipt: string) => {
      id = PolicyId.of(BigInt(receipt))
    }).catch((error: Error) => {
      throw error
    })

    if (id === undefined) {
      throw new ContractInteractionException(
        `${Policy.name} getPolicyId () failed to retrun a value.`
      )
    }

    return id
  }

  public async destroy(): Promise<void> {
    return super.destroy(this.sender)
  }
}
