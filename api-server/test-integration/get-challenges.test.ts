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

function getChallenges(): Request {
  return chai
    .request(app)
    .get('/challenge')
    .set('Content-Type', 'application/json')
    .set('Authorization', 'abracadabra')
}

const validRequest = {organisation: '5ds-demo'}
const noOrganisationRequest = {o: '5ds-demo'}
const expectedChallenges = [
  {
    challengeId: '5DS-C343334',
    policyId: '5DS-P202232'
  },
  {
    challengeId: '5DS-A333331',
    policyId: '5DS-P202232'
  }
]

describe('GET /challenge', () => {
  describe('errors when', () => {
    itEmptyBody(
      getChallenges(),
      '{"error":"organisation must be a string, organisation should not be empty"}'
    )

    itKeyMissingValue(getChallenges())

    itNoOrganisation(getChallenges(), noOrganisationRequest)

    itTextMediaType(getChallenges())

    itUnauthorizationAccess(getChallenges())
  })

  it('returns all challenges', (done) => {
    getChallenges()
      .send(validRequest)
      .end((error, result) => {
        result.should.have.status(200)
        result.should.be.json
        result.body.should.deep.equal(expectedChallenges)
        done()
      })
  })
})
