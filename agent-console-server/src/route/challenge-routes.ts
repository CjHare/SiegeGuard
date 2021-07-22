import {
  authorizationValidator,
  contentTypeValidator,
  jsonParserSmallContent
} from '@just_another_developer/common-server'
import {Router} from 'express'
import {getPendingChallenges} from '../controller/challenge-controller'
import cors from 'cors'

export class ChallengeRoutes {
  private path = '/:organizationId/:agentId/challenges'

  public addTo(router: Router): void {
    router.options(
      this.path,
      cors(),
      authorizationValidator(),
      contentTypeValidator(),
      jsonParserSmallContent
    )

    router.post(
      this.path,
      cors(),
      authorizationValidator(),
      contentTypeValidator(),
      jsonParserSmallContent,
      getPendingChallenges
    )
  }
}
