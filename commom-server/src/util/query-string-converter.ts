import {ParsedQs} from 'qs'
import {log} from '../container'

/**
 * Parses the named parameter, when NaN the given default is returned.
 *
 * On parameter pollution case (multiple parameters with the same key), all are ignored in favour of the default value.
 */
export function queryStringParameterToNumber(
  name: string,
  parameters: ParsedQs,
  defaultValue: number
): number {
  let parsed

  if (parameters[name] !== undefined) {
    try {
      parsed = quitelyConvert(parameters[name] as string, defaultValue)
    } catch (e) {
      log.warn(
        `Query parameter: ${name}, with value: ${parameters[name]} was not a string type`
      )
    }
  }

  if (Number.isNaN(parsed) || parsed === undefined) {
    log.warn(
      `Query parameter: ${name}, with value: ${parameters[name]} was not a number or undefined`
    )
    return defaultValue
  }

  return parsed
}

function quitelyConvert(value: string, defaultValue: number): number {
  try {
    return Number(value)
  } catch (e) {
    return defaultValue
  }
}
