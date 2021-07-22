import {Request, Response} from 'express'
import {PolicyId} from '@just_another_developer/solidity'
import {log, organizations} from '../container'

export function startAuthorization(request: Request, response: Response): void {
  const policyId = PolicyId.of(BigInt(request.params.policyId))
  const organizationId = BigInt(request.params.organizationId)

  const organization = organizations.get(organizationId)

  if (organization !== undefined) {
    const startAuthorization = async () =>
      await organization.startAuthorization(policyId)

    startAuthorization()
      .then(() => {
        response.status(200)
      })
      .catch((error: Error) => {
        log.error(
          'Organization %s, startAuthorization for Policy %s failed. %s',
          organizationId,
          policyId,
          error
        )
        response.status(500)
      })
  } else {
    log.warn('No mapped Organization for OrganizationId %s', organizationId)
    response.status(404)
  }

  response.setHeader('Content-Type', 'application/json')
  response.end()
}
