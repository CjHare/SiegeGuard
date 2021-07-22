import chai, {expect} from 'chai'
import {instance, mock, when, verify} from 'ts-mockito'
import {IncomingHttpHeaders} from 'http'
import {NextFunction, Request, Response} from 'express'
import {authorizationValidator} from '../../src/middleware/authorization-validator'
import {HttpException} from '../../src/exception/http-exception'

chai.should()

const response: Response = mock<Response>()
const next: NextFunction = (err?: unknown) => {
  if (err !== undefined) {
    throw err
  }
}

function authorizationHeader(authorization?: string): IncomingHttpHeaders {
  const headers = mock<IncomingHttpHeaders>()
  when(headers['authorization']).thenReturn(authorization)
  return headers
}

describe('Authorization validator', () => {
  describe('passes when authorization header', () => {
    it('matches', (done) => {
      const request: Request = mock<Request>()
      const headers = authorizationHeader('a99b44v568zzz')
      when(request.headers).thenReturn(instance(headers))

      authorizationValidator()(instance(request), instance(response), next)

      verify(headers['authorization']).called()

      done()
    })

    it('matches with prefixed whitespace', (done) => {
      const request: Request = mock<Request>()
      const headers = authorizationHeader('  a99b44v568zzz')
      when(request.headers).thenReturn(instance(headers))

      authorizationValidator()(instance(request), instance(response), next)

      verify(headers['authorization']).called()

      done()
    })

    it('matches with suffixed whitespace', (done) => {
      const request: Request = mock<Request>()
      const headers = authorizationHeader('a99b44v568zzz   ')
      when(request.headers).thenReturn(instance(headers))

      authorizationValidator()(instance(request), instance(response), next)

      verify(headers['authorization']).called()

      done()
    })
  })

  describe('fails when authorization header is', () => {
    it('case mismatches', (done) => {
      const request: Request = mock<Request>()
      const headers = authorizationHeader('A99b44v568zzz')
      when(request.headers).thenReturn(instance(headers))

      expect(() =>
        authorizationValidator()(instance(request), instance(response), next)
      )
        .to.throw(HttpException, '')
        .with.property('status', 401)

      verify(headers['authorization']).called()

      done()
    })
    it('empty', (done) => {
      const request: Request = mock<Request>()
      const headers = authorizationHeader('')
      when(request.headers).thenReturn(instance(headers))

      expect(() =>
        authorizationValidator()(instance(request), instance(response), next)
      )
        .to.throw(HttpException, '')
        .with.property('status', 401)

      verify(headers['authorization']).called()

      done()
    })
    it('undefined', (done) => {
      const request: Request = mock<Request>()
      const headers = authorizationHeader(undefined)
      when(request.headers).thenReturn(instance(headers))

      expect(() =>
        authorizationValidator()(instance(request), instance(response), next)
      )
        .to.throw(HttpException, '')
        .with.property('status', 401)

      verify(headers['authorization']).called()

      done()
    })
  })
})
