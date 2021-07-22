import 'reflect-metadata'
import chai from 'chai'
import {ChallengeRequest} from '../../src/model/challenge-request'
import {JsonValidator, verifyJson} from '../validator/JsonValidator'

chai.should()

function verify(json: string): JsonValidator<ChallengeRequest> {
  return verifyJson(ChallengeRequest, json)
}

describe('Challenge Request validation', () => {
  describe('passes when', () => {
    it('valid', (done) => {
      verify(validChallenge).isValid(done)
    })
  })

  describe('fails when', () => {
    it('empty object', (done) => {
      verify(empty)
        .hasMissing('evalParam')
        .hasMissing('auditLog')
        .validationError(done)
    })

    it('evalParam is empty', (done) => {
      verify(emptyEvalParam)
        .hasMissingString('evalParam.action')
        .hasMissingString('evalParam.resource')
        .validationError(done)
    })

    it('no evalParam.action', (done) => {
      verify(noEvalParamAction)
        .hasMissingString('evalParam.action')
        .validationError(done)
    })

    it('no evalParam.resource', (done) => {
      verify(noEvalParamResource)
        .hasMissingString('evalParam.resource')
        .validationError(done)
    })

    it('no auditLog.user', (done) => {
      verify(noAuditLogUser)
        .hasMissingString('auditLog.user')
        .validationError(done)
    })

    it('no auditLog.reason', (done) => {
      verify(noAuditLogReason)
        .hasMissingString('auditLog.reason')
        .validationError(done)
    })

    it('non-string evalParam.action', (done) => {
      verify(nonStringEvalParamAction)
        .hasInvalidString('evalParam.action')
        .validationError(done)
    })

    it('non-string evalParam.resource', (done) => {
      verify(nonStringEvalParamResource)
        .hasInvalidString('evalParam.resource')
        .validationError(done)
    })

    it('non-string auditLog.user', (done) => {
      verify(nonStringAuditLogUser)
        .hasInvalidString('auditLog.user')
        .validationError(done)
    })

    it('non-string auditLog.reason', (done) => {
      verify(nonStringAuditLogReason)
        .hasInvalidString('auditLog.reason')
        .validationError(done)
    })

    it('null evalParam.action', (done) => {
      verify(nullEvalParamAction)
        .hasMissingString('evalParam.action')
        .validationError(done)
    })

    it('null evalParam.resource', (done) => {
      verify(nullEvalParamResource)
        .hasMissingString('evalParam.resource')
        .validationError(done)
    })

    it('null auditLog.user', (done) => {
      verify(nullAuditLogUser)
        .hasMissingString('auditLog.user')
        .validationError(done)
    })

    it('null auditLog.reason', (done) => {
      verify(nullAuditLogReason)
        .hasMissingString('auditLog.reason')
        .validationError(done)
    })

    it('no evalParam.action, non-string evalParam.resource and null auditLog.reason', (done) => {
      verify(noEvalParamActionNonStringEvalResournceNullAuditLogReason)
        .hasMissingString('evalParam.action')
        .hasInvalidString('evalParam.resource')
        .hasMissingString('auditLog.reason')
        .validationError(done)
    })
  })

  const empty = '{}'

  const action = 'download'
  const resource = '5ds-policies.docx'
  const user = 'peter@5ds.io'
  const reason = 'Updating website'
  const evalParam = `{"action":"${action}", "resource":"${resource}"}`
  const auditLog = `{"user":"${user}", "reason":"${reason}"}`

  const validChallenge = `{"evalParam":${evalParam}, "auditLog":${auditLog}}`
  const emptyEvalParam = validChallenge.replace(`${evalParam}`, '{}')

  const noEvalParamAction = validChallenge.replace(`"action":"${action}",`, '')
  const nullEvalParamAction = validChallenge.replace(`"${action}"`, 'null')
  const nonStringEvalParamAction = validChallenge.replace(`"${action}"`, '292')

  const noEvalParamResource = validChallenge.replace(
    `, "resource":"${resource}"`,
    ''
  )
  const nullEvalParamResource = validChallenge.replace(`"${resource}"`, 'null')
  const nonStringEvalParamResource = validChallenge.replace(
    `"${resource}"`,
    '7788'
  )

  const noAuditLogUser = validChallenge.replace(`"user":"${user}",`, '')
  const nullAuditLogUser = validChallenge.replace(`"${user}"`, 'null')
  const nonStringAuditLogUser = validChallenge.replace(`"${user}"`, '3574')

  const noAuditLogReason = validChallenge.replace(`, "reason":"${reason}"`, '')
  const nullAuditLogReason = validChallenge.replace(`"${reason}"`, 'null')
  const nonStringAuditLogReason = validChallenge.replace(`"${reason}"`, '44')

  const noEvalParamActionNonStringEvalResournceNullAuditLogReason =
    noEvalParamAction
      .replace(`"${resource}"`, '292')
      .replace(`"${reason}"`, 'null')
})
