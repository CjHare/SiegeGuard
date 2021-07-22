import {App} from '@just_another_developer/common-server'
import {OrganizationRoutes} from './route/organization-routes'
import {log} from './container'

// The log reference triggers init of the container
log.verbose('Container initialization')

const app = new App([new OrganizationRoutes()], getPort())

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
