import {expect} from 'chai'

export interface Comparable<T> {
  value: T
}

/**
 * Compares equality for two defined comparable objects.
 */
export function expectEquals<T>(a: Comparable<T>, b: Comparable<T>): void {
  expect(a).is.not.undefined
  expect(a.value).is.not.undefined
  expect(b).is.not.undefined
  expect(b.value).is.not.undefined

  expect(a.value).equals(b.value)
}
