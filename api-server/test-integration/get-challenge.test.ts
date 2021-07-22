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

function getChallenge(challengeId: number): Request {
  return chai
    .request(app)
    .get(`/challenge/${challengeId}`)
    .set('Content-Type', 'application/json')
    .set('Authorization', 'abracadabra')
}

const unknownChallengeId = 45
const knownChallengeId = 12321
const validRequest = {organisation: '5ds-demo'}
const noOrganisationRequest = {o: '5ds-demo'}
const expectedChallenge = {
  challengeId: '5DS-C343334',
  policyId: '5DS-P202232',
  request: {
    evalParam: {
      action: 'download',
      resource: '5ds-policies.docx'
    },
    auditLog: {
      user: 'peter@5ds.io',
      reason: 'Updating website'
    }
  },
  response: {
    status: 'complete',
    result: 'approve'
  }
}

describe('GET /challenge/{:challengeId}', () => {
  describe('errors when', () => {
    itEmptyBody(
      getChallenge(unknownChallengeId),
      '{"error":"organisation must be a string, organisation should not be empty"}'
    )

    itKeyMissingValue(getChallenge(knownChallengeId))

    itNoOrganisation(getChallenge(knownChallengeId), noOrganisationRequest)

    itTextMediaType(getChallenge(knownChallengeId))

    itUnauthorizationAccess(getChallenge(knownChallengeId))

    it('matching challenge is not found', (done) => {
      getChallenge(unknownChallengeId)
        .send(validRequest)
        .end((error, result) => {
          result.should.have.status(404)
          result.should.be.json
          result.body.should.be.empty
          done()
        })
    })
  })

  it('returns matching challenge', (done) => {
    getChallenge(knownChallengeId)
      .send(validRequest)
      .end((error, result) => {
        result.should.have.status(200)
        result.should.be.json
        result.body.should.deep.equal(expectedChallenge)
        done()
      })
  })
})
