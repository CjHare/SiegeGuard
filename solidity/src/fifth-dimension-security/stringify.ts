/**
 * As of writing, JSON.stringify() lack supoprt for bigint. stringify provides that replacer function.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
export function stringify(json: any): string {
  return JSON.stringify(
    json,
    (_, value) => (typeof value === 'bigint' ? value.toString() : value) // return everything else unchanged
  )
}
