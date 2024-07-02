import {IsNotEmpty, IsString} from 'class-validator'

export class CreateAgentRequest {
  @IsNotEmpty()
  @IsString()
  public name!: string

  @IsNotEmpty()
  @IsString()
  public mobile!: string

  @IsNotEmpty()
  @IsString()
  public organisation!: string
}
