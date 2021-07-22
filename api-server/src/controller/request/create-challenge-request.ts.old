import {IsNotEmpty, IsString, ValidateNested} from 'class-validator'
import {Type} from 'class-transformer'
import {ChallengeRequest} from '../../model/challenge-request'

export class CreateChallengesRequest {
  @IsNotEmpty()
  @IsString()
  public organisation!: string

  @IsNotEmpty()
  @IsString()
  public policyId!: string

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => ChallengeRequest)
  public request!: ChallengeRequest
}
