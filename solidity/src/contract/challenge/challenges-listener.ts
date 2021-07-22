import {log} from '../../container'
import {stringify} from '../../fifth-dimension-security/stringify'
import {ActionId} from '../domain/action/action-id'
import {AgentId} from '../domain/agent/agent-id'
import {AuthorizedChallenge} from '../domain/challenge/authorized-challenge'
import {Challenges} from './challenges'
import {ChallengeId} from '../domain/challenge/challenge-id'
import {ChallengeTitle} from '../domain/challenge/challenge-title'
import {ChallengeMessage} from '../domain/challenge/challenge-message'
import {DeniedChallenge} from '../domain/challenge/denied-challenge'
import {DeviceId} from '../domain/device/device-id'
import {DeviceToken} from '../domain/device/device-token'
import {EmittedEvent} from '../../web3/domain/emitted-event'
import {EthereumAddress} from '../../web3/domain/ethereum-address'
import {FifthDimensionSecurityWeb3WebSocket} from '../../web3/fifth-dimension-security-web3-ws'
import {PendingChallenge} from '../domain/challenge/pending-challenge'
import {PolicyId} from '../domain/policy/policy-id'
import {SolidityContractListener} from '../../fifth-dimension-security/solidity-contract-listener'
import {Timestamp} from '../domain/time/timestamp'

interface CreatedAuthorizedChallenge {
  challenge: {
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
}

interface CreatedDeniedChallenge {
  challenge: {
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
}

interface CreatedPendingChallenge {
  challenge: {
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
}

export interface CreatedAuthorizedChallengeHandler {
  (challenge: AuthorizedChallenge): void
}

export interface CreatedDeniedChallengeHandler {
  (challenge: DeniedChallenge): void
}

export interface CreatedPendingChallengeHandler {
  (challenge: PendingChallenge): void
}

export class ChallengesListener extends SolidityContractListener {
  constructor(
    web3: FifthDimensionSecurityWeb3WebSocket,
    contract: EthereumAddress
  ) {
    super(web3, contract, Challenges.name)
  }

  public startCreatedAuthorizedChallengeListening(
    handler: CreatedAuthorizedChallengeHandler
  ): void {
    const subscribe = () => {
      return this.getContract().events.createdAuthorizedChallenge()
    }

    const delegate = (emitted: EmittedEvent<CreatedAuthorizedChallenge>) => {
      log.verbose('%s event emitted from: %s', emitted.event, emitted.address)

      log.debug('Event: %s', emitted)
      log.debug('Name: %s', emitted.event)
      log.debug('Variables: %s', emitted.returnValues)

      const deflated = emitted.returnValues.challenge

      const challengeId = ChallengeId.of(BigInt(deflated.challengeId))
      const actionId = ActionId.of(BigInt(deflated.actionId))
      const agentId = AgentId.of(BigInt(deflated.agentId))
      const policyId = PolicyId.of(BigInt(deflated.policyId))
      const deviceId = DeviceId.of(BigInt(deflated.deviceId))
      const deviceToken = DeviceToken.of(deflated.deviceToken)
      const title = ChallengeTitle.of(deflated.challengeTitle)
      const message = ChallengeMessage.of(deflated.challengeMessage)
      const emitDate = Timestamp.of(BigInt(deflated.emitDate))
      const authorizedDate = Timestamp.of(BigInt(deflated.authorizedDate))

      if (log.isDebugEnabled()) {
        log.debug(
          'Issue Challenge: %s, %s, %s, %s, %s, %s, %s, %s, %s, %s',
          stringify(policyId),
          stringify(actionId),
          stringify(agentId),
          stringify(deviceId),
          stringify(deviceToken),
          stringify(challengeId),
          stringify(title),
          stringify(message),
          stringify(emitDate),
          stringify(authorizedDate)
        )
      }

      const challenge = AuthorizedChallenge.of(
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

      handler(challenge)
    }

    const eventName = `${this.getName()}.createdAuthorizedChallenge( AuthorizedChallenge )`

    this.startListening(eventName, subscribe, delegate)
  }

  public startCreatedDeniedChallengeListening(
    handler: CreatedDeniedChallengeHandler
  ): void {
    const subscribe = () => {
      return this.getContract().events.createdDeniedChallenge()
    }

    const delegate = (emitted: EmittedEvent<CreatedDeniedChallenge>) => {
      log.verbose('%s event emitted from: %s', emitted.event, emitted.address)

      log.debug('Event: %s', emitted)
      log.debug('Name: %s', emitted.event)
      log.debug('Variables: %s', emitted.returnValues)

      const deflated = emitted.returnValues.challenge

      const challengeId = ChallengeId.of(BigInt(deflated.challengeId))
      const actionId = ActionId.of(BigInt(deflated.actionId))
      const agentId = AgentId.of(BigInt(deflated.agentId))
      const policyId = PolicyId.of(BigInt(deflated.policyId))
      const deviceId = DeviceId.of(BigInt(deflated.deviceId))
      const deviceToken = DeviceToken.of(deflated.deviceToken)
      const title = ChallengeTitle.of(deflated.challengeTitle)
      const message = ChallengeMessage.of(deflated.challengeMessage)
      const emitDate = Timestamp.of(BigInt(deflated.emitDate))
      const deniedDate = Timestamp.of(BigInt(deflated.deniedDate))

      if (log.isDebugEnabled()) {
        log.debug(
          'Issue Challenge: %s, %s, %s, %s, %s, %s, %s, %s, %s, %s',
          stringify(policyId),
          stringify(actionId),
          stringify(agentId),
          stringify(deviceId),
          stringify(deviceToken),
          stringify(challengeId),
          stringify(title),
          stringify(message),
          stringify(emitDate),
          stringify(deniedDate)
        )
      }

      const challenge = DeniedChallenge.of(
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

      handler(challenge)
    }

    const eventName = `${this.getName()}.createdDeniedChallenge( AuthorizedChallenge )`

    this.startListening(eventName, subscribe, delegate)
  }

  public startCreatedPendingChallengeListening(
    handler: CreatedPendingChallengeHandler
  ): void {
    const subscribe = () => {
      return this.getContract().events.createdPendingChallenge()
    }

    const delegate = (emitted: EmittedEvent<CreatedPendingChallenge>) => {
      log.verbose('%s event emitted from: %s', emitted.event, emitted.address)

      log.debug('Event: %s', emitted)
      log.debug('Name: %s', emitted.event)
      log.debug('Variables: %s', emitted.returnValues)

      const deflated = emitted.returnValues.challenge

      const challengeId = ChallengeId.of(BigInt(deflated.challengeId))
      const actionId = ActionId.of(BigInt(deflated.actionId))
      const agentId = AgentId.of(BigInt(deflated.agentId))
      const policyId = PolicyId.of(BigInt(deflated.policyId))
      const deviceId = DeviceId.of(BigInt(deflated.deviceId))
      const deviceToken = DeviceToken.of(deflated.deviceToken)
      const title = ChallengeTitle.of(deflated.challengeTitle)
      const message = ChallengeMessage.of(deflated.challengeMessage)
      const emitDate = Timestamp.of(BigInt(deflated.emitDate))

      if (log.isDebugEnabled()) {
        log.debug(
          'Issue Challenge: %s, %s, %s, %s, %s, %s, %s, %s, %s',
          stringify(policyId),
          stringify(actionId),
          stringify(agentId),
          stringify(deviceId),
          stringify(deviceToken),
          stringify(challengeId),
          stringify(title),
          stringify(message),
          stringify(emitDate)
        )
      }

      const challenge = PendingChallenge.of(
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

      handler(challenge)
    }

    const eventName = `${this.getName()}.createdPendingChallenge( AuthorizedChallenge )`

    this.startListening(eventName, subscribe, delegate)
  }
}
