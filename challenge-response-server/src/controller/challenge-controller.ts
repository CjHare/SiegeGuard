import {plainToClass} from 'class-transformer'
import {Request, Response} from 'express'
import {log, organizations} from '../container'
import {
  ActionId,
  ChallengeId,
  PolicyId,
  stringify
} from '@just_another_developer/solidity'
import {CreateChallengeReplyRequest} from './request/create-challenge-reply-request'

export function createChallengeReply(
  request: Request,
  response: Response
): void {
  const reply = plainToClass(CreateChallengeReplyRequest, request.body)
  const organizationId = BigInt(request.params.organizationId)

  const organization = organizations.get(organizationId)

  if (organization !== undefined) {
    const policyId = PolicyId.of(reply.policyId)
    const actionId = ActionId.of(reply.actionId)
    const challengeId = ChallengeId.of(reply.challengeId)
    const confirmation = reply.confirmation

    organization
      .challengeResponse(policyId, actionId, challengeId, confirmation)
      .then(() => {
        response.sendStatus(202)
        response.end()
      })
      .catch((error: Error) => {
        log.error(
          'Challenge Reply failed for Policy %s, Action %s, Challenge %s, Condifmration %s, %s',
          stringify(policyId),
          stringify(actionId),
          challengeId,
          confirmation,
          error
        )
        response.status(500).end()
      })
  } else {
    log.error('No Organization mapped for OrganizationId %s', organizationId)
    response.status(404).end()
  }
}
