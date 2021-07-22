import chai, {expect} from 'chai'
import {instance, mock, when, verify} from 'ts-mockito'
import {IncomingHttpHeaders} from 'http'
import {NextFunction, Request, Response} from 'express'
import {contentTypeValidator} from '../../src/middleware/content-type-validator'
import {HttpException} from '../../src/exception/http-exception'

chai.should()

const response: Response = mock<Response>()
const next: NextFunction = (err?: unknown) => {
  if (err !== undefined) {
    throw err
  }
}

function contentTypeHeader(contentType?: string): IncomingHttpHeaders {
  const headers = mock<IncomingHttpHeaders>()
  when(headers['content-type']).thenReturn(contentType)
  return headers
}

describe('Content-Type filter', () => {
  describe('passes when MIME type is', () => {
    it('"application/json"', (done) => {
      const request: Request = mock<Request>()
      const headers = contentTypeHeader('application/json')
      when(request.headers).thenReturn(instance(headers))

      contentTypeValidator()(instance(request), instance(response), next)

      verify(headers['content-type']).called()

      done()
    })

    it('"   application/json"', (done) => {
      const request: Request = mock<Request>()
      const headers = contentTypeHeader('   application/json')
      when(request.headers).thenReturn(instance(headers))

      contentTypeValidator()(instance(request), instance(response), next)

      verify(headers['content-type']).called()

      done()
    })

    it('"application/json   "', (done) => {
      const request: Request = mock<Request>()
      const headers = contentTypeHeader('application/json   ')
      when(request.headers).thenReturn(instance(headers))

      contentTypeValidator()(instance(request), instance(response), next)

      verify(headers['content-type']).called()

      done()
    })

    it('"APPLICATION/JSON"', (done) => {
      const request: Request = mock<Request>()
      const headers = contentTypeHeader('APPLICATION/JSON')
      when(request.headers).thenReturn(instance(headers))

      contentTypeValidator()(instance(request), instance(response), next)

      verify(headers['content-type']).called()

      done()
    })

    it('"application/json; charset=utf-8"', (done) => {
      const request: Request = mock<Request>()
      const headers = contentTypeHeader('application/json; charset=utf-8')
      when(request.headers).thenReturn(instance(headers))

      contentTypeValidator()(instance(request), instance(response), next)

      verify(headers['content-type']).called()

      done()
    })

    it('"application/json;  charset=utf-8"', (done) => {
      const request: Request = mock<Request>()
      const headers = contentTypeHeader('application/json; charset=utf-8')
      when(request.headers).thenReturn(instance(headers))

      contentTypeValidator()(instance(request), instance(response), next)

      verify(headers['content-type']).called()

      done()
    })

    it('"application/json ; charset=utf-8"', (done) => {
      const request: Request = mock<Request>()
      const headers = contentTypeHeader('application/json; charset=utf-8')
      when(request.headers).thenReturn(instance(headers))

      contentTypeValidator()(instance(request), instance(response), next)

      verify(headers['content-type']).called()

      done()
    })
  })

  describe('fails when MIME type is', () => {
    it('empty', (done) => {
      const request: Request = mock<Request>()
      const headers = contentTypeHeader('')
      when(request.headers).thenReturn(instance(headers))

      expect(() =>
        contentTypeValidator()(instance(request), instance(response), next)
      )
        .to.throw(HttpException, '')
        .with.property('status', 406)

      verify(headers['content-type']).called()

      done()
    })

    it('undefined', (done) => {
      const request: Request = mock<Request>()
      const headers = contentTypeHeader(undefined)
      when(request.headers).thenReturn(instance(headers))

      expect(() =>
        contentTypeValidator()(instance(request), instance(response), next)
      )
        .to.throw(HttpException, '')
        .with.property('status', 406)

      verify(headers['content-type']).called()

      done()
    })

    it('"text/plain"', (done) => {
      const request: Request = mock<Request>()
      const headers = contentTypeHeader('text/plain')
      when(request.headers).thenReturn(instance(headers))

      expect(() =>
        contentTypeValidator()(instance(request), instance(response), next)
      )
        .to.throw(HttpException, '')
        .with.property('status', 406)

      verify(headers['content-type']).called()

      done()
    })

    it('"application/json; charset=utf-22"', (done) => {
      const request: Request = mock<Request>()
      const headers = contentTypeHeader('application/json; charset=utf-22')
      when(request.headers).thenReturn(instance(headers))

      expect(() =>
        contentTypeValidator()(instance(request), instance(response), next)
      )
        .to.throw(HttpException, '')
        .with.property('status', 406)

      verify(headers['content-type']).called()

      done()
    })
  })

  describe('fails when Content-Type header is', () => {
    it('absent', (done) => {
      const request: Request = mock<Request>()

      expect(() =>
        contentTypeValidator()(instance(request), instance(response), next)
      )
        .to.throw(HttpException, '')
        .with.property('status', 406)

      done()
    })
  })
})
