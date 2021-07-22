import {IsBoolean, IsNotEmpty} from 'class-validator'

export class CreateChallengeReplyRequest {
  @IsNotEmpty()
  public policyId!: bigint

  @IsNotEmpty()
  public actionId!: bigint

  @IsNotEmpty()
  public challengeId!: bigint

  @IsNotEmpty()
  @IsBoolean()
  public confirmation!: boolean
}
