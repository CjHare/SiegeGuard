import {IsNotEmpty, IsString} from 'class-validator'

export class ChallengeResponse {
  @IsNotEmpty()
  @IsString()
  public status!: string

  @IsNotEmpty()
  @IsString()
  public result!: string
}

export function challengeResponse(
  status: string,
  result: string
): ChallengeResponse {
  const challenge = new ChallengeResponse()
  challenge.status = status
  challenge.result = result
  return challenge
}
