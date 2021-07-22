/**
 * A generic result handler function.
 */
export interface ResultHandler<T> {
  (result: T): void
}
