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

function deleteChallenge(challengeId: number): Request {
  return chai
    .request(app)
    .delete(`/challenge/${challengeId}`)
    .set('Content-Type', 'application/json')
    .set('Authorization', 'abracadabra')
}

const unknownChallengeId = 45
const knownChallengeId = 12321
const validRequest = {organisation: '5ds-demo'}
const noOrganisationRequest = {o: '5ds-demo'}

describe('DELETE /challenge/{:challengeId}', () => {
  describe('errors when', () => {
    itEmptyBody(
      deleteChallenge(knownChallengeId),
      '{"error":"organisation must be a string, organisation should not be empty"}'
    )

    itKeyMissingValue(deleteChallenge(knownChallengeId))

    itNoOrganisation(deleteChallenge(knownChallengeId), noOrganisationRequest)

    itTextMediaType(deleteChallenge(knownChallengeId))

    itUnauthorizationAccess(deleteChallenge(knownChallengeId))

    it('matching challenge is not found', (done) => {
      deleteChallenge(unknownChallengeId)
        .send(validRequest)
        .end((error, result) => {
          result.should.have.status(404)
          result.should.be.json
          result.body.should.be.empty
          done()
        })
    })
  })

  it('deletes matching challenge', (done) => {
    deleteChallenge(knownChallengeId)
      .send(validRequest)
      .end((error, result) => {
        result.should.have.status(204)
        result.should.be.json
        result.body.should.be.empty
        done()
      })
  })
})
