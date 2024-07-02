import 'reflect-metadata'
import express, {Application} from 'express'
import http from 'http'
import {Routes} from './route/routes'
import {errorHandler} from './middleware/error-handler'
import {defaultHandler} from './middleware/default-handler'
import {log, accessLog} from './container'

export class App {
  public app: Application
  public port: number

  constructor(routes: Routes[], port: number) {
    this.app = express()
    this.port = port

    this.removeExpressResponseHeader()
    this.addAccessLogging()

    this.addRoutes(routes)
    this.addErrorHandler()
    this.addDefaultRouteHandler()
  }

  private addAccessLogging() {
    this.app.use(accessLog)
  }

  private addRoutes(routes: Routes[]) {
    const router = express.Router()

    routes.forEach((routes) => {
      routes.addTo(router)
    })

    this.app.use('/', router)
  }

  private addErrorHandler() {
    this.app.use(errorHandler)
  }

  private removeExpressResponseHeader() {
    this.app.disable('x-powered-by')
  }

  private addDefaultRouteHandler() {
    this.app.use(defaultHandler)
  }

  public listen(): http.Server {
    return this.app.listen(this.port, () => {
      log.info(`App listening on port ${this.port}`)
    })
  }
}

export const jsonParserSmallContent = express.json({limit: 250})
export const jsonParserMediumContent = express.json({limit: '5kb'})
export const jsonParserLargeContent = express.json({limit: '25kb'})
