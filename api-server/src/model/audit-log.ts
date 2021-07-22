import {IsNotEmpty, IsString} from 'class-validator'

export class AuditLog {
  @IsNotEmpty()
  @IsString()
  public user!: string

  @IsNotEmpty()
  @IsString()
  public reason!: string
}

export function auditLog(user: string, reason: string): AuditLog {
  const audit = new AuditLog()
  audit.user = user
  audit.reason = reason
  return audit
}
