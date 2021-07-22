import chai from 'chai'
import {Agent} from '../../src/model/agent'
import {JsonValidator, verifyJson} from '../validator/JsonValidator'

chai.should()

function verify(json: string): JsonValidator<Agent> {
  return verifyJson(Agent, json)
}

describe('Agent validation', () => {
  describe('passes when', () => {
    it('valid', (done) => {
      verify(validAgent).isValid(done)
    })
  })

  describe('fails when', () => {
    it('empty object', (done) => {
      verify(empty)
        .hasMissingString('agentId')
        .hasMissingString('name')
        .hasMissingString('mobile')
        .hasMissingString('organisation')
        .validationError(done)
    })

    it('no agent id', (done) => {
      verify(noAgentId).hasMissingString('agentId').validationError(done)
    })

    it('no name', (done) => {
      verify(noName).hasMissingString('name').validationError(done)
    })

    it('no mobile', (done) => {
      verify(noMobile).hasMissingString('mobile').validationError(done)
    })

    it('no organisation', (done) => {
      verify(noOrganisation)
        .hasMissingString('organisation')
        .validationError(done)
    })

    it('no name and non-string mobile', (done) => {
      verify(noNameNonStringMobileJson)
        .hasMissingString('name')
        .hasInvalidString('mobile')
        .validationError(done)
    })

    it('non-string agentId', (done) => {
      verify(nonStringAgentId).hasInvalidString('agentId').validationError(done)
    })

    it('non-string name', (done) => {
      verify(nonStringName).hasInvalidString('name').validationError(done)
    })

    it('non-string mobile', (done) => {
      verify(nonStringMobile).hasInvalidString('mobile').validationError(done)
    })

    it('non-string organisation', (done) => {
      verify(nonStringOrganisation)
        .hasInvalidString('organisation')
        .validationError(done)
    })

    it('non-string name and mobile', (done) => {
      verify(nonStringNameAndMobile)
        .hasInvalidString('name')
        .hasInvalidString('mobile')
        .validationError(done)
    })

    it('null agentId', (done) => {
      verify(nullAgentId).hasMissingString('agentId').validationError(done)
    })

    it('null name', (done) => {
      verify(nullName).hasMissingString('name').validationError(done)
    })

    it('null mobile', (done) => {
      verify(nullMobile).hasMissingString('mobile').validationError(done)
    })

    it('null organisation', (done) => {
      verify(nullOrganisation)
        .hasMissingString('organisation')
        .validationError(done)
    })
  })

  const agentId = 'AGENT-ID-22'
  const name = 'Secret agent Smart'
  const mobile = '012345678'
  const organisation = 'Consumer Corp'

  const empty = '{}'
  const validAgent = `{"agentId":"${agentId}", "name":"${name}", "mobile":"${mobile}", "organisation": "${organisation}"}`

  const noAgentId = validAgent.replace(`"agentId":"${agentId}",`, '')
  const nullAgentId = validAgent.replace(`"${agentId}"`, 'null')
  const nonStringAgentId = validAgent.replace(`"${agentId}"`, '1111')

  const noName = validAgent.replace(`"name":"${name}",`, '')
  const nullName = validAgent.replace(`"${name}"`, 'null')
  const nonStringName = validAgent.replace(`"${name}"`, '2323')

  const noMobile = validAgent.replace(`"mobile":"${mobile}",`, '')
  const nullMobile = validAgent.replace(`"${mobile}"`, 'null')
  const nonStringMobile = validAgent.replace(`"${mobile}"`, '3434343')

  const noOrganisation = validAgent.replace(
    `, "organisation": "${organisation}"`,
    ''
  )
  const nullOrganisation = validAgent.replace(`"${organisation}"`, 'null')
  const nonStringOrganisation = validAgent.replace(`"${organisation}"`, '5555')

  const nonStringNameAndMobile = nonStringName.replace(`"${mobile}"`, '3434343')
  const noNameNonStringMobileJson = nonStringMobile.replace(
    `"name":"${name}",`,
    ''
  )
})
