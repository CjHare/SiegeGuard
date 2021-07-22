import {EmittedEvent} from '../../../web3/domain/emitted-event'

/**
 * Delegate for performing the handling of an emitted event.
 */
export interface EmittedEventHandler<T> {
  (event: EmittedEvent<T>): void
}
