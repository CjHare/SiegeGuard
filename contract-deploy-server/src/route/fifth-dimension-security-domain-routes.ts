import {Router} from 'express'
import {
  authorizationValidator,
  contentTypeValidator,
  jsonParserSmallContent
} from '@just_another_developer/common-server'
import {deploy} from '../controller/fifth-dimension-security-domain-controller'

export class FifthDimensionSecurityDomainRoutes {
  private path = '/fifth-dimension-security-domain'

  public addTo(router: Router): void {
    router.post(
      `${this.path}/deploy`,
      authorizationValidator(),
      contentTypeValidator(),
      jsonParserSmallContent,
      deploy
    )
  }
}
