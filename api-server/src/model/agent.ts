import {IsNotEmpty, IsString} from 'class-validator'

export class Agent {
  @IsNotEmpty()
  @IsString()
  public agentId!: string

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

export function agent(
  agentId: string,
  name: string,
  mobile: string,
  organisation: string
): Agent {
  const agent = new Agent()
  agent.agentId = agentId
  agent.name = name
  agent.mobile = mobile
  agent.organisation = organisation
  return agent
}
