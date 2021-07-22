import chai from 'chai'
import chaiHttp from 'chai-http'
import {Request} from 'superagent'
import app from '../src/server'
import {classToPlain} from 'class-transformer'
import {CreateChallengeResponse} from '../src/controller/response/create-challenge-response'
import {
  itEmptyBody,
  itKeyMissingValue,
  itNoOrganisation,
  itTextMediaType,
  itUnauthorizationAccess
} from './common/endpoint'

chai.use(chaiHttp)
chai.should()

function postChallenge(): Request {
  return chai
    .request(app)
    .post('/challenge')
    .set('Content-Type', 'application/json')
    .set('Authorization', 'abracadabra')
}

const expectedChallenges = classToPlain(
  new CreateChallengeResponse('23498SDF98S9D8F9S8D984J4J', '5DS-C12221')
)
const noOrganisationRequest = {
  policyId: '5DS-P202232',
  request: {
    evalParam: {action: 'download', resource: '5ds-policies.docx'},
    auditLog: {user: 'peter@5ds.io', reason: 'Updatingwebsite'}
  }
}
const noActionInEvaluationParameterInRequest = {
  policyId: '5DS-P202232',
  request: {
    evalParam: {resource: '5ds-policies.docx'},
    auditLog: {user: 'peter@5ds.io', reason: 'Updatingwebsite'}
  },
  organisation: '5ds-demo'
}
const validRequest = {
  policyId: '5DS-P202232',
  request: {
    evalParam: {action: 'download', resource: '5ds-policies.docx'},
    auditLog: {user: 'peter@5ds.io', reason: 'Updatingwebsite'}
  },
  organisation: '5ds-demo'
}

describe('POST /challenge', () => {
  describe('errors when', () => {
    itEmptyBody(
      postChallenge(),
      '{"error":"organisation must be a string, organisation should not be empty, policyId must be a string, policyId should not be empty, request should not be empty"}'
    )

    itKeyMissingValue(postChallenge())

    itNoOrganisation(postChallenge(), noOrganisationRequest)

    itTextMediaType(postChallenge())

    itUnauthorizationAccess(postChallenge())

    it('no action in request.evalParam', (done) => {
      postChallenge()
        .send(noActionInEvaluationParameterInRequest)
        .end((error, result) => {
          result.should.have.status(400)
          result.should.be.json
          result.body.message.should.equal(
            '{"error":"request.evalParam.action must be a string, request.evalParam.action should not be empty"}'
          )
          done()
        })
    })
  })

  it('create challenge', (done) => {
    postChallenge()
      .send(validRequest)
      .end((error, result) => {
        result.should.have.status(201)
        result.should.be.json
        result.body.should.deep.equal(expectedChallenges)
        done()
      })
  })
})
