/**
 * Fields of the expected Web3 event object.
 */
export interface EmittedEvent<T> {
  address: string
  event: string
  returnValues: T
}
