import {IsNotEmpty, IsString} from 'class-validator'

export class EvaluationParameter {
  @IsNotEmpty()
  @IsString()
  public action!: string

  @IsNotEmpty()
  @IsString()
  public resource!: string
}

export function evaluationParameter(
  action: string,
  resource: string
): EvaluationParameter {
  const evaluationParameter = new EvaluationParameter()
  evaluationParameter.action = action
  evaluationParameter.resource = resource
  return evaluationParameter
}
