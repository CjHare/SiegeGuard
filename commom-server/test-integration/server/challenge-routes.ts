import {Router} from 'express'
import {Routes} from '../../src/route/routes'
import {getChallenge} from '../server/get-challenge'
import {GetChallengeRequest} from '../server/get-challenge-request'
import {bodyValidator} from '../../src/middleware/body-validator'
import {contentTypeValidator} from '../../src/middleware/content-type-validator'
import {authorizationValidator} from '../../src/middleware/authorization-validator'
import {jsonParserSmallContent} from '../../src/app'

export class ChallengeRoutes implements Routes {
  addTo(router: Router): void {
    router.get(
      '/challenge/:challengeId',
      authorizationValidator(),
      contentTypeValidator(),
      jsonParserSmallContent,
      bodyValidator(GetChallengeRequest),
      getChallenge
    )
  }
}
