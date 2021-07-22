import {IsNotEmpty, ValidateNested} from 'class-validator'
import {Type} from 'class-transformer'
import {EvaluationParameter} from './evaluation-parameter'
import {AuditLog} from './audit-log'

export class ChallengeRequest {
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => EvaluationParameter)
  public evalParam!: EvaluationParameter

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => AuditLog)
  public auditLog!: AuditLog
}

export function challengeRequest(
  evalParam: EvaluationParameter,
  auditLog: AuditLog
): ChallengeRequest {
  const challenge = new ChallengeRequest()
  challenge.evalParam = evalParam
  challenge.auditLog = auditLog

  return challenge
}
