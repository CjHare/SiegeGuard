import {plainToClass} from 'class-transformer'
import {Request, Response} from 'express'
import {GetChallengeRequest} from './get-challenge-request'

export function getChallenge(request: Request, response: Response): void {
  const getChallenge = plainToClass(GetChallengeRequest, request.body)

  if (
    request.params.challengeId === '12321' &&
    getChallenge.organisation === 'integration-test'
  ) {
    response.setHeader('Content-Type', 'application/json')
    response.send('{"outcome":"success"}')
    response.end()
  } else {
    response.setHeader('Content-Type', 'application/json')
    response.status(404)
    response.end()
  }
}
