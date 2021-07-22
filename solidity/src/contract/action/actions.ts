import {parseChallengeIds} from '../domain/serialization/challenge-id-serialization'
import {ActionId} from '../domain/action/action-id'
import {AgentId} from '../domain/agent/agent-id'
import {AuthorizedAction} from '../domain/action/authorized-action'
import {ChallengeId} from '../domain/challenge/challenge-id'
import {ChallengeTitle} from '../domain/challenge/challenge-title'
import {ChallengeMessage} from '../domain/challenge/challenge-message'
import {DeviceId} from '../domain/device/device-id'
import {DeviceToken} from '../domain/device/device-token'
import {DeniedAction} from '../domain/action/denied-action'
import {OrganizationId} from '../domain/organization/organization-id'
import {PendingAction} from '../domain/action/pending-action'
import {PolicyId} from '../domain/policy/policy-id'
import {Timestamp} from '../domain/time/timestamp'
import {EthereumAddress} from '../../web3/domain/ethereum-address'
import {FifthDimensionSecurityWeb3} from '../../web3/fifth-dimension-security-web3'
import {SolidityContract} from '../../fifth-dimension-security/solidity-contract'
import {ContractInteractionException} from '../../exception/contract-interaction-exception'
import {stringify} from '../../fifth-dimension-security/stringify'

interface BlockchainAuthorizedAction {
  id: string
  policyId: string
  authorizedChallenges: string[]
  deniedChallenges: string[]
  pendingChallenges: string[]
  requestDate: string
  authorizedDate: string
}

interface BlockchainDeniedAction {
  id: string
  policyId: string
  authorizedChallenges: string[]
  deniedChallenges: string[]
  pendingChallenges: string[]
  requestDate: string
  deniedDate: string
}

interface BlockchainPendingAction {
  id: string
  policyId: string
  authorizedChallenges: string[]
  deniedChallenges: string[]
  pendingChallenges: string[]
  requestDate: string
}

export class Actions extends SolidityContract {
  private sender: EthereumAddress

  constructor(
    web3: FifthDimensionSecurityWeb3,
    funded: EthereumAddress,
    contract: EthereumAddress
  ) {
    super(web3, contract, Actions.name)
    this.sender = funded
  }

  public async createPending(policy: PolicyId): Promise<void> {
    return this.sendOneArgument(
      'createPending',
      this.sender,
      policy.value,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      (_: Record<string, unknown>) => {
        this.logContract('created Action for Policy', {id: policy.value})
      }
    )
  }

  public async createPendingChallenge(
    organization: OrganizationId,
    policy: PolicyId,
    pendingAction: ActionId,
    agent: AgentId,
    device: DeviceId,
    token: DeviceToken,
    title: ChallengeTitle,
    message: ChallengeMessage
  ): Promise<void> {
    return this.sendEightArguments(
      'createPendingChallenge',
      this.sender,
      organization.value,
      policy.value,
      pendingAction.value,
      agent.value,
      device.value,
      token.value,
      title.value,
      message.value,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      (_: Record<string, unknown>) => {
        this.logContract('created Pending Challenge', {
          organizationId: organization.value,
          policyId: policy.value,
          actionId: pendingAction.value,
          agentId: agent.value,
          deviceId: device.value,
          deviceToken: token.value
        })
      }
    )
  }

  public async lastActionId(): Promise<ActionId> {
    let last: ActionId | undefined

    await this.call('lastActionId', this.sender, (receipt: string) => {
      last = ActionId.of(BigInt(receipt))
    }).catch((error: Error) => {
      throw error
    })

    if (last === undefined) {
      throw new ContractInteractionException(
        `${Actions.name} lastActionId () failed to retrun a value.`
      )
    }

    return last
  }

  public async getPending(id: ActionId): Promise<PendingAction> {
    let action: PendingAction | undefined

    await this.callOneArgument(
      'getPending',
      this.sender,
      id.value,
      (receipt: BlockchainPendingAction) => {
        if (receipt.id == '0') {
          throw new ContractInteractionException(
            `${Actions.name} getPending ( ${id.value} ) failed to retrun a value.`
          )
        }

        const actionId = ActionId.of(BigInt(receipt.id))
        const policyId = PolicyId.of(BigInt(receipt.policyId))
        const authorizedChallenges = parseChallengeIds(
          receipt.authorizedChallenges
        )
        const deniedChallenges = parseChallengeIds(receipt.deniedChallenges)
        const pendingChallenges = parseChallengeIds(receipt.pendingChallenges)

        const requestDate = Timestamp.of(BigInt(receipt.requestDate))

        action = PendingAction.of(
          actionId,
          policyId,
          authorizedChallenges,
          deniedChallenges,
          pendingChallenges,
          requestDate
        )
      }
    ).catch((error: Error) => {
      throw error
    })

    if (action === undefined) {
      throw new ContractInteractionException(
        `${stringify(id)} has no mapped PendingAction.`
      )
    }

    return action
  }

  public async getDenied(id: ActionId): Promise<DeniedAction> {
    let action: DeniedAction | undefined

    await this.callOneArgument(
      'getDenied',
      this.sender,
      id.value,
      (receipt: BlockchainDeniedAction) => {
        if (receipt.id == '0') {
          throw new ContractInteractionException(
            `${Actions.name} getDenied ( ${id.value} ) failed to retrun a value.`
          )
        }

        const actionId = ActionId.of(BigInt(receipt.id))
        const policyId = PolicyId.of(BigInt(receipt.policyId))
        const authorizedChallenges = parseChallengeIds(
          receipt.authorizedChallenges
        )
        const deniedChallenges = parseChallengeIds(receipt.deniedChallenges)
        const pendingChallenges = parseChallengeIds(receipt.pendingChallenges)
        const requestDate = Timestamp.of(BigInt(receipt.requestDate))
        const deniedDate = Timestamp.of(BigInt(receipt.deniedDate))

        action = DeniedAction.of(
          actionId,
          policyId,
          authorizedChallenges,
          deniedChallenges,
          pendingChallenges,
          requestDate,
          deniedDate
        )
      }
    ).catch((error: Error) => {
      throw error
    })

    if (action === undefined) {
      throw new ContractInteractionException(
        `${stringify(id)} has no mapped PendingAction.`
      )
    }

    return action
  }

  public async getAuthorized(id: ActionId): Promise<AuthorizedAction> {
    let action: AuthorizedAction | undefined

    await this.callOneArgument(
      'getAuthorized',
      this.sender,
      id.value,
      (receipt: BlockchainAuthorizedAction) => {
        if (receipt.id == '0') {
          throw new ContractInteractionException(
            `${Actions.name} getAuthorized ( ${id.value} ) failed to retrun a value.`
          )
        }

        const actionId = ActionId.of(BigInt(receipt.id))
        const policyId = PolicyId.of(BigInt(receipt.policyId))
        const authorizedChallenges = parseChallengeIds(
          receipt.authorizedChallenges
        )
        const deniedChallenges = parseChallengeIds(receipt.deniedChallenges)
        const pendingChallenges = parseChallengeIds(receipt.pendingChallenges)
        const requestDate = Timestamp.of(BigInt(receipt.requestDate))
        const authorizedDate = Timestamp.of(BigInt(receipt.authorizedDate))

        action = AuthorizedAction.of(
          actionId,
          policyId,
          authorizedChallenges,
          deniedChallenges,
          pendingChallenges,
          requestDate,
          authorizedDate
        )
      }
    ).catch((error: Error) => {
      throw error
    })

    if (action === undefined) {
      throw new ContractInteractionException(
        `${stringify(id)} has no mapped PendingAction.`
      )
    }

    return action
  }

  public async remove(id: ActionId): Promise<void> {
    return this.transitionAction('remove', 'removed', id)
  }

  public async authorize(id: ActionId): Promise<void> {
    return this.transitionAction('authorize', 'authorized', id)
  }

  public async deny(id: ActionId): Promise<void> {
    return this.transitionAction('deny', 'denied', id)
  }

  public async authorizePendingChallenge(
    id: ActionId,
    challenge: ChallengeId
  ): Promise<void> {
    return this.addChallenge(
      'authorizePendingChallenge',
      'Authorized',
      id,
      challenge
    )
  }

  public async denyPendingChallenge(
    id: ActionId,
    challenge: ChallengeId
  ): Promise<void> {
    return this.addChallenge('denyPendingChallenge', 'Denied', id, challenge)
  }

  public async destroy(): Promise<void> {
    return super.destroy(this.sender)
  }

  private async transitionAction(
    method: string,
    transition: string,
    id: ActionId
  ): Promise<void> {
    return this.sendOneArgument(
      method,
      this.sender,
      id.value,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      (_: Record<string, unknown>) => {
        this.logContract('transitioned Action', {
          id: id.value,
          transition: transition
        })
      }
    )
  }

  private async addChallenge(
    method: string,
    type: string,
    id: ActionId,
    challenge: ChallengeId
  ): Promise<void> {
    return this.sendTwoArguments(
      method,
      this.sender,
      id.value,
      challenge.value,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      (_: Record<string, unknown>) => {
        this.logContract('added Challenge', {
          challengeId: challenge.value,
          type: type,
          actionId: id.value
        })
      }
    )
  }
}
