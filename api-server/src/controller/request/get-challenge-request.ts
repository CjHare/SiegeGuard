import {IsNotEmpty, IsString} from 'class-validator'

export class GetChallengeRequest {
  @IsNotEmpty()
  @IsString()
  public organisation!: string
}
