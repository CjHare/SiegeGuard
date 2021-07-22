import {App} from '../../src/app'
import {log, setAccessLogger} from '../../src/container'
import {ChallengeRoutes} from './challenge-routes'
import {RequestHandler} from 'express'
import {Logger} from 'winston'
import {instance, mock} from 'ts-mockito'
import {setLogger} from '../../src/container'

export function doNothing(): RequestHandler {
  return (req, res, next) => {
    next()
  }
}

setAccessLogger(doNothing())

function setupLogger(): Logger {
  const log: Logger = mock<Logger>()
  setLogger(instance(log))
  return log
}

setupLogger()

const app = new App([new ChallengeRoutes()], getPort())

const server = app.listen()

process.on('SIGTERM', () => {
  log.info('SIGTERM signal received: closing HTTP server')
  server.close(() => {
    log.info('HTTP server closed')
  })
})

function getPort(): number {
  if (typeof process.env.PORT === 'undefined' || process.env.PORT === null) {
    return 3000
  } else {
    return parseInt(process.env.PORT)
  }
}

export default app.app
