import {log} from '../../container'
import {inflateChallengeIds} from '../domain/serialization/challenge-id-serialization'
import {stringify} from '../../fifth-dimension-security/stringify'
import {AuthorizedAction} from '../domain/action/authorized-action'
import {Actions} from './actions'
import {ActionId} from '../domain/action/action-id'
import {DeniedAction} from '../domain/action/denied-action'
import {EmittedEvent} from '../../web3/domain/emitted-event'
import {EthereumAddress} from '../../web3/domain/ethereum-address'
import {FifthDimensionSecurityWeb3WebSocket} from '../../web3/fifth-dimension-security-web3-ws'
import {PendingAction} from '../domain/action/pending-action'
import {PolicyId} from '../domain/policy/policy-id'
import {SolidityContractListener} from '../../fifth-dimension-security/solidity-contract-listener'
import {Timestamp} from '../domain/time/timestamp'

interface CreatedAuthorizedAction {
  action: {
    id: string
    policyId: string
    authorizedChallenges: string[]
    deniedChallenges: string[]
    pendingChallenges: string[]
    requestDate: string
    authorizedDate: string
  }
}

interface CreatedDeniedAction {
  action: {
    id: string
    policyId: string
    authorizedChallenges: string[]
    deniedChallenges: string[]
    pendingChallenges: string[]
    requestDate: string
    deniedDate: string
  }
}

interface CreatedPendingAction {
  action: {
    id: string
    policyId: string
    authorizedChallenges: string[]
    deniedChallenges: string[]
    pendingChallenges: string[]
    requestDate: string
  }
}

export interface CreatedAuthorizedActionHandler {
  (challenge: AuthorizedAction): void
}

export interface CreatedDeniedActionHandler {
  (challenge: DeniedAction): void
}

export interface CreatedPendingActionHandler {
  (challenge: PendingAction): void
}

export class ActionsListener extends SolidityContractListener {
  constructor(
    web3: FifthDimensionSecurityWeb3WebSocket,
    contract: EthereumAddress
  ) {
    super(web3, contract, Actions.name)
  }

  public startCreatedAuthorizedActionListening(
    handler: CreatedAuthorizedActionHandler
  ): void {
    const subscribe = () => {
      return this.getContract().events.createdAuthorizedAction()
    }

    const delegate = (emitted: EmittedEvent<CreatedAuthorizedAction>) => {
      log.verbose('%s event emitted from: %s', emitted.event, emitted.address)

      log.debug('Event: %s', emitted)
      log.debug('Name: %s', emitted.event)
      log.debug('Variables: %s', emitted.returnValues)

      const deflated = emitted.returnValues.action

      const id = ActionId.of(BigInt(deflated.id))
      const policyId = PolicyId.of(BigInt(deflated.policyId))
      const authorizedChallenges = inflateChallengeIds(
        deflated.authorizedChallenges
      )
      const deniedChallenges = inflateChallengeIds(deflated.deniedChallenges)
      const pendingChallenges = inflateChallengeIds(deflated.pendingChallenges)
      const requestDate = Timestamp.of(BigInt(deflated.requestDate))
      const authorizedDate = Timestamp.of(BigInt(deflated.authorizedDate))

      if (log.isDebugEnabled()) {
        log.debug(
          'Issue Challenge: %s, %s, %s, %s, %s, %s, %s',
          stringify(id),
          stringify(policyId),
          stringify(authorizedChallenges),
          stringify(deniedChallenges),
          stringify(pendingChallenges),
          stringify(requestDate),
          stringify(authorizedDate)
        )
      }

      const action = AuthorizedAction.of(
        id,
        policyId,
        authorizedChallenges,
        deniedChallenges,
        pendingChallenges,
        requestDate,
        authorizedDate
      )

      handler(action)
    }

    const eventName = `${this.getName()}.createdAuthorizedAction( AuthorizedAction )`

    this.startListening(eventName, subscribe, delegate)
  }

  public startCreatedDeniedActionListening(
    handler: CreatedDeniedActionHandler
  ): void {
    const subscribe = () => {
      return this.getContract().events.createdDeniedAction()
    }

    const delegate = (emitted: EmittedEvent<CreatedDeniedAction>) => {
      log.verbose('%s event emitted from: %s', emitted.event, emitted.address)

      log.debug('Event: %s', emitted)
      log.debug('Name: %s', emitted.event)
      log.debug('Variables: %s', emitted.returnValues)

      const deflated = emitted.returnValues.action

      const id = ActionId.of(BigInt(deflated.id))
      const policyId = PolicyId.of(BigInt(deflated.policyId))
      const authorizedChallenges = inflateChallengeIds(
        deflated.authorizedChallenges
      )
      const deniedChallenges = inflateChallengeIds(deflated.deniedChallenges)
      const pendingChallenges = inflateChallengeIds(deflated.pendingChallenges)
      const requestDate = Timestamp.of(BigInt(deflated.requestDate))
      const deniedDate = Timestamp.of(BigInt(deflated.deniedDate))

      if (log.isDebugEnabled()) {
        log.debug(
          'Issue Challenge: %s, %s, %s, %s, %s, %s, %s',
          stringify(id),
          stringify(policyId),
          stringify(authorizedChallenges),
          stringify(deniedChallenges),
          stringify(pendingChallenges),
          stringify(requestDate),
          stringify(deniedDate)
        )
      }

      const action = DeniedAction.of(
        id,
        policyId,
        authorizedChallenges,
        deniedChallenges,
        pendingChallenges,
        requestDate,
        deniedDate
      )

      handler(action)
    }

    const eventName = `${this.getName()}.createdDeniedAction( AuthorizedAction )`

    this.startListening(eventName, subscribe, delegate)
  }

  public startCreatedPendingActionListening(
    handler: CreatedPendingActionHandler
  ): void {
    const subscribe = () => {
      return this.getContract().events.createdPendingAction()
    }

    const delegate = (emitted: EmittedEvent<CreatedPendingAction>) => {
      log.verbose('%s event emitted from: %s', emitted.event, emitted.address)

      log.debug('Event: %s', emitted)
      log.debug('Name: %s', emitted.event)
      log.debug('Variables: %s', emitted.returnValues)

      const deflated = emitted.returnValues.action

      const id = ActionId.of(BigInt(deflated.id))
      const policyId = PolicyId.of(BigInt(deflated.policyId))
      const authorizedChallenges = inflateChallengeIds(
        deflated.authorizedChallenges
      )
      const deniedChallenges = inflateChallengeIds(deflated.deniedChallenges)
      const pendingChallenges = inflateChallengeIds(deflated.pendingChallenges)
      const requestDate = Timestamp.of(BigInt(deflated.requestDate))

      if (log.isDebugEnabled()) {
        log.debug(
          'Issue Challenge: %s, %s, %s, %s, %s, %s',
          stringify(id),
          stringify(policyId),
          stringify(authorizedChallenges),
          stringify(deniedChallenges),
          stringify(pendingChallenges),
          stringify(requestDate)
        )
      }

      const action = PendingAction.of(
        id,
        policyId,
        authorizedChallenges,
        deniedChallenges,
        pendingChallenges,
        requestDate
      )

      handler(action)
    }

    const eventName = `${this.getName()}.createdPendingAction( AuthorizedAction )`

    this.startListening(eventName, subscribe, delegate)
  }
}
