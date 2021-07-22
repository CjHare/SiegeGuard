import {IsNotEmpty, IsOptional, IsString} from 'class-validator'

export class UpdatePolicyRequest {
  @IsOptional()
  @IsString()
  public callbackUrl?: string

  @IsOptional()
  @IsString()
  public defaultTimeout?: string

  @IsNotEmpty()
  @IsString()
  public status!: string

  @IsNotEmpty()
  @IsString()
  public organisation!: string
}
