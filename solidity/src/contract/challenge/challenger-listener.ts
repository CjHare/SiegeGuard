import {log} from '../../container'
import {stringify} from '../../fifth-dimension-security/stringify'
import {ActionId} from '../domain/action/action-id'
import {Challenger} from './challenger'
import {ChallengeId} from '../domain/challenge/challenge-id'
import {ChallengeTitle} from '../domain/challenge/challenge-title'
import {ChallengeMessage} from '../domain/challenge/challenge-message'
import {DeviceId} from '../domain/device/device-id'
import {DeviceToken} from '../domain/device/device-token'
import {EmittedEvent} from '../../web3/domain/emitted-event'
import {EthereumAddress} from '../../web3/domain/ethereum-address'
import {FifthDimensionSecurityWeb3WebSocket} from '../../web3/fifth-dimension-security-web3-ws'
import {OrganizationId} from '../domain/organization/organization-id'
import {PolicyId} from '../domain/policy/policy-id'
import {SolidityContractListener} from '../../fifth-dimension-security/solidity-contract-listener'

interface IssueChallengeEvent {
  organizationId: string
  policyId: string
  actionId: string
  deviceId: string
  deviceToken: string
  challengeId: string
  challengeTitle: string
  challengeMessage: string
}

export interface IssueChallengeHandler {
  (
    authorizingOrganization: OrganizationId,
    authorizingPolicy: PolicyId,
    authorizingAction: ActionId,
    recipient: DeviceId,
    token: DeviceToken,
    id: ChallengeId,
    title: ChallengeTitle,
    message: ChallengeMessage
  ): void
}

export class ChallengerListener extends SolidityContractListener {
  constructor(
    web3: FifthDimensionSecurityWeb3WebSocket,
    contract: EthereumAddress
  ) {
    super(web3, contract, Challenger.name)
  }

  public startIssueChallengeListening(handler: IssueChallengeHandler): void {
    const subscribe = () => {
      return this.getContract().events.issueChallenge()
    }

    const delegate = (emitted: EmittedEvent<IssueChallengeEvent>) => {
      log.verbose('%s event emitted from: %s', emitted.event, emitted.address)

      log.debug('Event: %s', emitted)
      log.debug('Name: %s', emitted.event)
      log.debug('Variables: %s', emitted.returnValues)

      const deflated = emitted.returnValues

      const organization = OrganizationId.of(BigInt(deflated.organizationId))
      const policy = PolicyId.of(BigInt(deflated.policyId))
      const action = ActionId.of(BigInt(deflated.actionId))
      const recipient = DeviceId.of(BigInt(deflated.deviceId))
      const token = DeviceToken.of(deflated.deviceToken)
      const id = ChallengeId.of(BigInt(deflated.challengeId))
      const title = ChallengeTitle.of(deflated.challengeTitle)
      const message = ChallengeMessage.of(deflated.challengeMessage)

      if (log.isDebugEnabled()) {
        log.debug(
          'Issue Challenge: %s, %s, %s, %s, %s, %s, %s',
          stringify(organization),
          stringify(policy),
          stringify(action),
          stringify(recipient),
          stringify(token),
          stringify(id),
          stringify(title),
          stringify(message)
        )
      }

      handler(
        organization,
        policy,
        action,
        recipient,
        token,
        id,
        title,
        message
      )
    }

    const eventName = `${this.getName()}.issueChallenge( OrganizationId, PolicyId, ActionId, DeviceId, ChallengeId, string, string )`

    this.startListening(eventName, subscribe, delegate)
  }
}
