import {IsArray, IsNotEmpty, IsOptional, IsString} from 'class-validator'

export class CreatePolicyRequest {
  @IsOptional()
  @IsString()
  public callbackUrl?: string

  @IsOptional()
  @IsString()
  public defaultTimeout?: string

  @IsNotEmpty()
  @IsString()
  public templateType!: string

  @IsNotEmpty()
  @IsArray()
  @IsString({each: true})
  public agents!: string[]

  @IsNotEmpty()
  @IsString()
  public organisation!: string
}
