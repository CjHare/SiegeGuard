import {RequestHandler} from 'express'
import {HttpException} from '../exception/http-exception'
import {authorizedToken} from '../container'

/**
 * Excludes any request with the "Content-Type" header set to anything other than a JSON media type.
 */
export function authorizationValidator(): RequestHandler {
  return (req, res, next) => {
    const token = req.headers['authorization']

    if (authorized(token)) {
      next()
    } else {
      next(new HttpException(401))
    }
  }
}

function authorized(token: string | undefined): boolean {
  return token !== undefined && authorizedToken(token.trim())
}
