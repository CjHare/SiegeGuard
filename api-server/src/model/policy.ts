import {IsArray, IsNotEmpty, IsString} from 'class-validator'

export class Policy {
  @IsNotEmpty()
  @IsString()
  public policyId!: string

  @IsNotEmpty()
  @IsString()
  public callbackUrl?: string

  @IsNotEmpty()
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

export function policy(
  policyId: string,
  templateType: string,
  agents: string[],
  organisation: string,
  callbackUrl?: string,
  defaultTimeout?: string
): Policy {
  const policy = new Policy()
  policy.policyId = policyId
  policy.callbackUrl = callbackUrl
  policy.defaultTimeout = defaultTimeout
  policy.templateType = templateType
  policy.agents = agents
  policy.organisation = organisation
  return policy
}
