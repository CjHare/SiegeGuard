import {IsNotEmpty, IsString} from 'class-validator'

export class SlimPolicy {
  @IsNotEmpty()
  @IsString()
  public policyId!: string

  @IsNotEmpty()
  @IsString()
  public templateType!: string
}

export function slimPolicy(policyId: string, templateType: string): SlimPolicy {
  const policy = new SlimPolicy()
  policy.policyId = policyId
  policy.templateType = templateType
  return policy
}
