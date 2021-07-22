import {RequestHandler} from 'express'
import {HttpException} from '../exception/http-exception'

/**
 * Excludes any request with the "Content-Type" header set to anything other than a JSON media type.
 */
export function contentTypeValidator(): RequestHandler {
  return (req, res, next) => {
    const contentType = req.headers['content-type']?.toLowerCase().trim()

    if (isJson(contentType) || isJsonWithUtf8(contentType)) {
      next()
    } else {
      next(new HttpException(406))
    }
  }
}

function isJson(contentType: string | undefined): boolean {
  return contentType === 'application/json'
}

/**
 * Determines whether the content type is in the form of 'application/json;charset=utf-8' after whitespace is removed.
 */
function isJsonWithUtf8(contentType: string | undefined): boolean {
  if (contentType !== undefined) {
    const split = contentType.split(';')
    return (
      split.length == 2 &&
      split[0].trim() === 'application/json' &&
      split[1].trim() === 'charset=utf-8'
    )
  }
  return false
}
