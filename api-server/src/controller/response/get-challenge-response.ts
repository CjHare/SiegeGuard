import {ChallengeRequest} from '../../model/challenge-request'
import {ChallengeResponse} from '../../model/challenge-response'

export class GetChallengeResponse {
  public challengeId: string
  public policyId: string
  public request: ChallengeRequest
  public response: ChallengeResponse

  constructor(
    challengeId: string,
    policyId: string,
    request: ChallengeRequest,
    response: ChallengeResponse
  ) {
    this.challengeId = challengeId
    this.policyId = policyId
    this.request = request
    this.response = response
  }
}
