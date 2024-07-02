import {IsNotEmpty, IsString} from 'class-validator'

export class DeletePolicyRequest {
  @IsNotEmpty()
  @IsString()
  public organisation!: string
}
