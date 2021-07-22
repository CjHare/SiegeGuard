import {NextFunction, Request, Response} from 'express'

/**
 * Returns a 404 status with no content.
 */
export function defaultHandler(
  request: Request,
  response: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
): void {
  response.status(404).json().send()
}
