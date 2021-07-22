import {
  AgentId,
  PendingChallenge,
  stringify
} from '@just_another_developer/solidity'
import {queryStringParameterToNumber} from '@just_another_developer/common-server'
import {Request, Response} from 'express'
import {log, agentChallengesViews} from '../container'

export function getPendingChallenges(
  request: Request,
  response: Response
): void {
  const page = queryStringParameterToNumber('page', request.query, 1)
  const limit = queryStringParameterToNumber('limit', request.query, 25)

  log.silly(`${page} ${limit}`)

  const organizationId = BigInt(request.params.organizationId)
  const agentId = AgentId.of(BigInt(request.params.agentId))
  const view = agentChallengesViews.get(organizationId)

  response.setHeader('Content-Type', 'application/json')

  if (view !== undefined) {
    const pendingChallenges = async () =>
      await view.pendingChallengesForAgent(agentId)

    pendingChallenges()
      .then((challenges: PendingChallenge[]) => {
        const json = stringify(challenges)

        response.status(200).send(json)
      })
      .catch((error: Error) => {
        log.error(
          'Getting the pending challenges for Agent %s of Organization %s failed. %s',
          agentId.value,
          organizationId,
          error
        )
        response.status(500).end()
      })
  } else {
    log.warn(
      'No mapped AgentChallengesView for OrganizationId %s',
      organizationId
    )
    response.status(404).end()
  }
}
