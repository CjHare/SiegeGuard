import chai from 'chai'
import chaiHttp from 'chai-http'
import {Request} from 'superagent'
import app from './server/server'

chai.use(chaiHttp)
chai.should()

function getChallenge(challengeId: number): Request {
  return chai
    .request(app)
    .get(`/challenge/${challengeId}`)
    .set('Content-Type', 'application/json')
    .set('Authorization', 'abracadabra')
}

const knownChallengeId = 12321

describe('Content limit for Json parser', () => {
  it('small', (done) => {
    getChallenge(knownChallengeId)
      .send(
        `{"length":"over two hundred and fifty btes in length", "noise":"${twoHundredBytes}"}`
      )
      .end((error, result) => {
        result.should.have.status(413)
        result.should.be.json
        result.body.should.be.empty
        done()
      })
  })
})

const oneHundredBytes =
  '0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000'
const twoHundredBytes = oneHundredBytes + oneHundredBytes
