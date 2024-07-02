import {IsNotEmpty, IsString} from 'class-validator'

export class GetChallengesRequest {
  @IsNotEmpty()
  @IsString()
  public organisation!: string
}
