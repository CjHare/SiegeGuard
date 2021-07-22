import {ActionId} from '../domain/action/action-id'
import {AgentId} from '../domain/agent/agent-id'
import {AuthorizedChallenge} from '../domain/challenge/authorized-challenge'
import {ChallengeId} from '../domain/challenge/challenge-id'
import {ChallengeTitle} from '../domain/challenge/challenge-title'
import {ChallengeMessage} from '../domain/challenge/challenge-message'
import {DeniedChallenge} from '../domain/challenge/denied-challenge'
import {DeviceId} from '../domain/device/device-id'
import {DeviceToken} from '../domain/device/device-token'
import {OrganizationId} from '../domain/organization/organization-id'
import {PendingChallenge} from '../domain/challenge/pending-challenge'
import {PolicyId} from '../domain/policy/policy-id'
import {Timestamp} from '../domain/time/timestamp'
import {EthereumAddress} from '../../web3/domain/ethereum-address'
import {FifthDimensionSecurityWeb3} from '../../web3/fifth-dimension-security-web3'
import {SolidityContract} from '../../fifth-dimension-security/solidity-contract'
import {ContractInteractionException} from '../../exception/contract-interaction-exception'
import {stringify} from '../../fifth-dimension-security/stringify'

interface BlockchainAuthorizedChallenge {
  policyId: string
  actionId: string
  agentId: string
  deviceId: string
  deviceToken: string
  challengeId: string
  challengeTitle: string
  challengeMessage: string
  emitDate: string
  authorizedDate: string
}

interface BlockchainDeniedChallenge {
  policyId: string
  actionId: string
  agentId: string
  deviceId: string
  deviceToken: string
  challengeId: string
  challengeTitle: string
  challengeMessage: string
  emitDate: string
  deniedDate: string
}

interface BlockchainPendingChallenge {
  policyId: string
  actionId: string
  agentId: string
  deviceId: string
  deviceToken: string
  challengeId: string
  challengeTitle: string
  challengeMessage: string
  emitDate: string
}

export class Challenges extends SolidityContract {
  private sender: EthereumAddress

  constructor(
    web3: FifthDimensionSecurityWeb3,
    funded: EthereumAddress,
    contract: EthereumAddress
  ) {
    super(web3, contract, Challenges.name)
    this.sender = funded
  }

  public async createPending(
    organization: OrganizationId,
    policy: PolicyId,
    agent: AgentId,
    authorizing: ActionId,
    recipient: DeviceId,
    token: DeviceToken,
    title: ChallengeTitle,
    message: ChallengeMessage
  ): Promise<void> {
    return this.sendEightArguments(
      'createPending',
      this.sender,
      organization.value,
      policy.value,
      agent.value,
      authorizing.value,
      recipient.value,
      token.value,
      title.value,
      message.value,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      (_: Record<string, unknown>) => {
        this.logContract('created Challenge', {
          organizationId: organization.value,
          policyId: policy.value,
          actionId: authorizing.value,
          agentId: agent.value,
          deviceId: recipient.value,
          deviceToken: token.value,
          challengeTitle: title.value,
          challengeMessage: message.value
        })
      }
    )
  }

  public async lastChallengeId(): Promise<ChallengeId> {
    let last: ChallengeId | undefined

    await this.call('lastChallengeId', this.sender, (receipt: string) => {
      last = ChallengeId.of(BigInt(receipt))
    }).catch((error: Error) => {
      throw error
    })

    if (last === undefined) {
      throw new ContractInteractionException(
        `${Challenges.name} lastChallengeId () failed to retrun a value.`
      )
    }

    return last
  }

  public async getPending(id: ChallengeId): Promise<PendingChallenge> {
    let challenge: PendingChallenge | undefined

    await this.callOneArgument(
      'getPending',
      this.sender,
      id.value,
      (receipt: BlockchainPendingChallenge) => {
        if (receipt.challengeId == '0') {
          throw new ContractInteractionException(
            `${Challenges.name} getPending ( ${id.value} ) failed to retrun a value.`
          )
        }

        const policyId = PolicyId.of(BigInt(receipt.policyId))
        const actionId = ActionId.of(BigInt(receipt.actionId))
        const agentId = AgentId.of(BigInt(receipt.agentId))
        const deviceId = DeviceId.of(BigInt(receipt.deviceId))
        const deviceToken = DeviceToken.of(receipt.deviceToken)
        const challengeId = ChallengeId.of(BigInt(receipt.challengeId))
        const title = ChallengeTitle.of(receipt.challengeTitle)
        const message = ChallengeMessage.of(receipt.challengeMessage)
        const emitDate = Timestamp.of(BigInt(receipt.emitDate))

        challenge = PendingChallenge.of(
          policyId,
          actionId,
          agentId,
          deviceId,
          deviceToken,
          challengeId,
          title,
          message,
          emitDate
        )
      }
    ).catch((error: Error) => {
      throw error
    })

    if (challenge === undefined) {
      throw new ContractInteractionException(
        `${stringify(id)} has no mapped PendingChallenge.`
      )
    }

    return challenge
  }

  public async getDenied(id: ChallengeId): Promise<DeniedChallenge> {
    let challenge: DeniedChallenge | undefined

    await this.callOneArgument(
      'getDenied',
      this.sender,
      id.value,
      (receipt: BlockchainDeniedChallenge) => {
        if (receipt.challengeId == '0') {
          throw new ContractInteractionException(
            `${Challenges.name} getDenied ( ${id.value} ) failed to retrun a value.`
          )
        }

        const policyId = PolicyId.of(BigInt(receipt.policyId))
        const actionId = ActionId.of(BigInt(receipt.actionId))
        const agentId = AgentId.of(BigInt(receipt.agentId))
        const deviceId = DeviceId.of(BigInt(receipt.deviceId))
        const deviceToken = DeviceToken.of(receipt.deviceToken)
        const challengeId = ChallengeId.of(BigInt(receipt.challengeId))
        const title = ChallengeTitle.of(receipt.challengeTitle)
        const message = ChallengeMessage.of(receipt.challengeMessage)
        const emitDate = Timestamp.of(BigInt(receipt.emitDate))
        const deniedDate = Timestamp.of(BigInt(receipt.deniedDate))

        challenge = DeniedChallenge.of(
          policyId,
          actionId,
          agentId,
          deviceId,
          deviceToken,
          challengeId,
          title,
          message,
          emitDate,
          deniedDate
        )
      }
    ).catch((error: Error) => {
      throw error
    })

    if (challenge === undefined) {
      throw new ContractInteractionException(
        `${stringify(id)} has no mapped PendingChallenge.`
      )
    }

    return challenge
  }

  public async getAuthorized(id: ChallengeId): Promise<AuthorizedChallenge> {
    let challenge: AuthorizedChallenge | undefined

    await this.callOneArgument(
      'getAuthorized',
      this.sender,
      id.value,
      (receipt: BlockchainAuthorizedChallenge) => {
        if (receipt.challengeId == '0') {
          throw new ContractInteractionException(
            `${Challenges.name} getAuthorized ( ${id.value} ) failed to retrun a value.`
          )
        }

        const policyId = PolicyId.of(BigInt(receipt.policyId))
        const actionId = ActionId.of(BigInt(receipt.actionId))
        const agentId = AgentId.of(BigInt(receipt.agentId))
        const deviceId = DeviceId.of(BigInt(receipt.deviceId))
        const deviceToken = DeviceToken.of(receipt.deviceToken)
        const challengeId = ChallengeId.of(BigInt(receipt.challengeId))
        const title = ChallengeTitle.of(receipt.challengeTitle)
        const message = ChallengeMessage.of(receipt.challengeMessage)
        const emitDate = Timestamp.of(BigInt(receipt.emitDate))
        const authorizedDate = Timestamp.of(BigInt(receipt.authorizedDate))

        challenge = AuthorizedChallenge.of(
          policyId,
          actionId,
          agentId,
          deviceId,
          deviceToken,
          challengeId,
          title,
          message,
          emitDate,
          authorizedDate
        )
      }
    ).catch((error: Error) => {
      throw error
    })

    if (challenge === undefined) {
      throw new ContractInteractionException(
        `${stringify(id)} has no mapped PendingChallenge.`
      )
    }

    return challenge
  }

  public async remove(id: ChallengeId): Promise<void> {
    return this.transitionChallenge('remove', 'removed', id)
  }

  public async authorize(id: ChallengeId): Promise<void> {
    return this.transitionChallenge('authorize', 'authorized', id)
  }

  public async deny(id: ChallengeId): Promise<void> {
    return this.transitionChallenge('deny', 'denied', id)
  }

  public async destroy(): Promise<void> {
    return super.destroy(this.sender)
  }

  private async transitionChallenge(
    method: string,
    transition: string,
    id: ChallengeId
  ): Promise<void> {
    return this.sendOneArgument(
      method,
      this.sender,
      id.value,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      (_: Record<string, unknown>) => {
        this.logContract('transitioned Challenge', {
          id: id.value,
          transition: transition
        })
      }
    )
  }
}
