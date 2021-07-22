import {SolidityContract} from './solidity-contract'
import {log} from '../container'
import {StartEventListening} from './domain/event/start-event-listening'
import {EmittedEventHandler} from './domain/event/emitted-event-handler'

export abstract class SolidityContractListener extends SolidityContract {
  startListening<T>(
    eventName: string,
    listen: StartEventListening,
    delegate: EmittedEventHandler<T>
  ): void {
    log.debug('Subscribing to %s events', eventName)

    listen()
      .on('data', delegate)
      .on('error', (error: Error) => {
        log.error(
          `Encountered error when trying to listen for ${eventName} events: %s`,
          error
        )
      })

    log.verbose('Subscribed to %s events', eventName)
  }
}
