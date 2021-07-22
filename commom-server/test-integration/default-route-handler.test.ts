import chai from 'chai'
import chaiHttp from 'chai-http'
import {Request} from 'superagent'
import app from './server/server'

chai.use(chaiHttp)
chai.should()

function getNotSupportedPath(): Request {
  return chai.request(app).get(`/not-supported-path`)
}

describe('GET /not-supported-path', () => {
  it('returns page not found', (done) => {
    getNotSupportedPath().end((error, result) => {
      result.should.have.status(404)
      result.should.be.json
      result.body.should.be.empty
      done()
    })
  })
})
