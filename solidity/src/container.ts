import {Logger} from 'winston'

/**
 * Singleton logger configuration shared through the project.
 */
export let log: Logger

export function setLogger(singleLogger: Logger): void {
  log = singleLogger
}

export const maximumGasAmount = 7500000
