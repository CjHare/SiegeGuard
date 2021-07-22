import chai from 'chai'
import chaiHttp from 'chai-http'
import {Request} from 'superagent'
import app from '../src/server'
import {
  itEmptyBody,
  itKeyMissingValue,
  itNoOrganisation,
  itTextMediaType,
  itUnauthorizationAccess
} from './common/endpoint'

chai.use(chaiHttp)
chai.should()

function getPolicy(policyId: number): Request {
  return chai
    .request(app)
    .get(`/policy/${policyId}`)
    .set('Content-Type', 'application/json')
    .set('Authorization', 'abracadabra')
}

const unknownPolicyId = 45
const knownPolicyId = 12321
const validRequest = {organisation: '5ds-demo'}
const noOrganisationRequest = {o: '5ds-demo'}
const expectedPolicy = {
  policyId: '5DS-P122322',
  templateType: '2-3.MPA.Action',
  agents: ['5DS-A202221', '5DS-A202222', '5DS-A202226'],
  organisation: '5ds-demo'
}

describe('GET /policy/{:policyId}', () => {
  describe('errors when', () => {
    itEmptyBody(
      getPolicy(knownPolicyId),
      '{"error":"organisation must be a string, organisation should not be empty"}'
    )

    itKeyMissingValue(getPolicy(knownPolicyId))

    itNoOrganisation(getPolicy(knownPolicyId), noOrganisationRequest)

    itTextMediaType(getPolicy(knownPolicyId))

    itUnauthorizationAccess(getPolicy(knownPolicyId))

    it('matching challenge is not found', (done) => {
      getPolicy(unknownPolicyId)
        .send(validRequest)
        .end((error, result) => {
          result.should.have.status(404)
          result.should.be.json
          result.body.should.be.empty
          done()
        })
    })
  })

  it('returns matching policy', (done) => {
    getPolicy(knownPolicyId)
      .send(validRequest)
      .end((error, result) => {
        result.should.have.status(200)
        result.should.be.json
        result.body.should.deep.equal(expectedPolicy)
        done()
      })
  })
})
