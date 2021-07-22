import {
  authorizationValidator,
  contentTypeValidator,
  jsonParserSmallContent
} from '@just_another_developer/common-server'
import {Router} from 'express'
import {startAuthorization} from '../controller/organization-controller'

export class OrganizationRoutes {
  private path = '/organization'

  public addTo(router: Router): void {
    router.post(
      `${this.path}/:organizationId/:policyId`,
      authorizationValidator(),
      contentTypeValidator(),
      jsonParserSmallContent,
      startAuthorization
    )
  }
}
