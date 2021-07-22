import {ChallengeId} from '../challenge/challenge-id'

const uninitializedValue = 0n

export function parseChallengeIds(json: undefined | string[]): ChallengeId[] {
  if (json === undefined) {
    return new Array(0)
  }

  const inflated = []

  for (const id of json) {
    if (id !== undefined) {
      const value = BigInt(JSON.parse(id))

      if (value > uninitializedValue) {
        inflated.push(ChallengeId.of(value))
      }
    }
  }

  return inflated
}

export function inflateChallengeIds(flat: string[]): ChallengeId[] {
  const inflated = []

  for (const value of flat) {
    const id = BigInt(value)

    if (id > uninitializedValue) {
      inflated.push(ChallengeId.of(id))
    }
  }

  return inflated
}
