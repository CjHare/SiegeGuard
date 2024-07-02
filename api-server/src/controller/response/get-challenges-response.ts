export class GetChallengesResponse {
  public challengeId: string
  public policyId: string

  constructor(challengeId: string, policyId: string) {
    this.challengeId = challengeId
    this.policyId = policyId
  }
}
