import {RequestHandler} from 'express'
import {Logger} from 'winston'

/**
 * Singleton logger configuration shared through the project.
 */
export let log: Logger
export let accessLog: RequestHandler

export function setLogger(singletonLogger: Logger): void {
  log = singletonLogger
}

export function setAccessLogger(handler: RequestHandler): void {
  accessLog = handler
}

const tokens = ['abracadabra', 'a99b44v568zzz']

export function authorizedToken(token: string): boolean {
  return tokens.includes(token)
}
