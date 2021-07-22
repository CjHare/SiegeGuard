/**
 * Subscription to a smart contract event stream.
 */
export interface EventSubscription {
  unsubscribe(): void
}
