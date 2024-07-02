import {IsNotEmpty, IsString} from 'class-validator'

export class GetAgentsRequest {
  @IsNotEmpty()
  @IsString()
  public organisation!: string
}
