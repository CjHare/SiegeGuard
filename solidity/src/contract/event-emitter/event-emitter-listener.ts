import {FifthDimensionSecurityWeb3WebSocket} from '../../web3/fifth-dimension-security-web3-ws'
import {EthereumAddress} from '../../web3/domain/ethereum-address'
import {EventEmitter} from './event-emitter'
import {EventSubscription} from '../../fifth-dimension-security/domain/event/event-subscription'
import {log} from '../../container'
import {SolidityContract} from '../../fifth-dimension-security/solidity-contract'
import {EmittedEvent} from '../../web3/domain/emitted-event'

/**
 * Parameters of the stored event in the EventEmitter solidity.
 */
interface StoredEvent {
  _to: string
  _amount: string
}

/**
 * Encapsulates the listener behaviour for the EventEmitter contract.
 */
export class EventEmitterListener extends SolidityContract {
  private storedEventSubscription: EventSubscription | undefined

  constructor(
    web3: FifthDimensionSecurityWeb3WebSocket,
    contract: EthereumAddress
  ) {
    super(web3, contract, EventEmitter.name)
    this.startEventListening()
  }

  /**
   * Listen to the events emitted by the current contract connected to on WebSockets.
   */
  private startEventListening(): void {
    log.debug('Subscribing to %s stored events', EventEmitter.name)

    this.storedEventSubscription = this.getContract()
      .events.stored()
      .on('data', (stored: EmittedEvent<StoredEvent>) => {
        log.info('Data event: %s', stored)
        log.info('Event name: %s', stored.event)
        log.info('Event variables: %s', stored.returnValues)
        log.info('Event variable _to: %s', stored.returnValues._to)
        log.info('Event variable _amount: %s', stored.returnValues._amount)

        //TODO verify nothing expected is undefined

        //TODO logic for what todo sits here, may need additional fields on construction
      })
      .on('error', (error: Error) => {
        log.error('Error when trying to listen for events: %s', error)
      })
  }

  /**
   * Stop listening for events on the contract, use before deploying a new contract and listening to that.
   */
  private stopEventListening(): void {
    if (this.storedEventSubscription !== undefined) {
      log.verbose('Unsubscribing from %s stored events', EventEmitter.name)
      this.storedEventSubscription.unsubscribe()
    }
  }
}
