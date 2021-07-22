import {IsNotEmpty, IsString} from 'class-validator'

export class SlimAgent {
  @IsNotEmpty()
  @IsString()
  public agentId!: string

  @IsNotEmpty()
  @IsString()
  public name!: string
}

export function slimAgent(agentId: string, name: string): SlimAgent {
  const agent = new SlimAgent()
  agent.agentId = agentId
  agent.name = name
  return agent
}
