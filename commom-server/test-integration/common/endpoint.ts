import chai, {expect} from 'chai'
import chaiHttp from 'chai-http'
import {Request} from 'superagent'

chai.use(chaiHttp)
chai.should()

export function itEmptyBody(request: Request, message: string): void {
  it('no body', (done) => {
    request.end((error, result) => {
      result.should.have.status(400)
      result.should.be.json
      result.body.message.should.equal(message)
      done()
    })
  })
}

/**
 * Verifying the type and format of the validation error response.
 *
 * @param request end point request, that gets send with the given JSON.
 * @param json JSON request missning the 'organisation' field.
 */
export function itNoOrganisation(
  request: Request,
  json: Record<string, unknown>
): void {
  it('no organisation', (done) => {
    request.send(json).end((error, result) => {
      result.should.have.status(400)
      result.should.be.json
      result.type.should.equal('application/json')
      result.body.message.should.equal(
        '{"error":"organisation must be a string, organisation should not be empty"}'
      )

      done()
    })
  })
}

export function itTextMediaType(request: Request): void {
  it('media type is text/html', (done) => {
    request
      .set('Content-Type', 'text/html; charset=utf-8')
      .end((error, result) => {
        result.should.have.status(406)
        result.should.be.json
        result.type.should.equal('application/json')
        expect(result.body).to.be.empty
        done()
      })
  })
}

export function itUnauthorizationAccess(request: Request): void {
  it('acccess is unauthorized', (done) => {
    request.set('Authorization', '').end((error, result) => {
      result.should.have.status(401)
      result.should.be.json
      result.type.should.equal('application/json')
      expect(result.body).to.be.empty
      done()
    })
  })
}

/**
 * Verifies the body parser fails gracefully when the JSON is invalid.
 */
export function itKeyMissingValue(request: Request): void {
  it('a key is missing its value', (done) => {
    request.send('{ "organisation":  }').end((error, result) => {
      result.should.have.status(400)
      result.should.be.json
      result.type.should.equal('application/json')
      result.body.message.should.equal(
        'Unexpected token } in JSON at position 19'
      )

      done()
    })
  })
}
