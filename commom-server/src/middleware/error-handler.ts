import {NextFunction, Request, Response} from 'express'
import {HttpException} from '../exception/http-exception'
import {log} from '../container'

export function errorHandler(
  error: HttpException,
  request: Request,
  response: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
): void {
  const status = error.status || 500
  const message = error.message

  log.error('Error response: %s', JSON.stringify(error))

  const reponseWithoutContent = response
    .status(status)
    .set('Content-Type', 'application/json')

  try {
    // 401 Keep the 400 validation errors with content
    if (status < 401) {
      reponseWithoutContent.send({
        status,
        message
      })
    } else {
      reponseWithoutContent.end()
    }
  } catch (error) {
    log.error('Failed to write error message to response: %s', error)
  }
}
