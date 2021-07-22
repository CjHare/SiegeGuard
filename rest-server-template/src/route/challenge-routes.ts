import {
  bodyValidator,
  contentTypeValidator,
  jsonParserSmallContent
} from '@just_another_developer/common-server'
import {Router} from 'express'
import {createChallengeReply} from '../controller/challenge-controller'
import {CreateChallengeReplyRequest} from '../controller/request/create-challenge-reply-request'
import cors from 'cors'

export class ChallengeRoutes {
  private path = '/challenge-response'

  public addTo(router: Router): void {
    router.options(
      this.path,
      cors(),
      contentTypeValidator(),
      jsonParserSmallContent
    )

    router.post(
      this.path,
      cors(),
      contentTypeValidator(),
      jsonParserSmallContent,
      bodyValidator(CreateChallengeReplyRequest),
      createChallengeReply
    )
  }
}
