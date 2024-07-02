import {IsNotEmpty, IsString} from 'class-validator'

export class GetPolicyRequest {
  @IsNotEmpty()
  @IsString()
  public organisation!: string
}
