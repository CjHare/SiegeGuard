import {App} from '@just_another_developer/common-server'
import {log} from './container'
import {ChallengeRoutes} from './route/challenge-routes'

// The log reference triggers init of the container
log.verbose('Container initialization')

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
    return 3500
  } else {
    return parseInt(process.env.PORT)
  }
}

export default app.app
