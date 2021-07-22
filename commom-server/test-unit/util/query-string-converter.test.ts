import {ParsedQs} from 'qs'
import chai from 'chai'
import {instance, mock, when, verify} from 'ts-mockito'
import {queryStringParameterToNumber} from '../../src/util/query-string-converter'
import {Logger} from 'winston'
import {setLogger} from '../../src/container'

chai.should()

function setupLogger(): Logger {
  const log: Logger = mock<Logger>()
  setLogger(instance(log))
  return log
}

setupLogger()

const name = 'key'

function mockParameters(
  value: number | number[] | string | undefined
): ParsedQs {
  const parameters = mock<ParsedQs>()
  when(parameters[name]).thenReturn(`${value}`)
  return parameters
}

describe('Query String to number conversion', () => {
  describe('parses', () => {
    it('an integer number', (done) => {
      const defaultValue = 99
      const value = 49
      const parameters = mockParameters(value)

      const result = queryStringParameterToNumber(
        name,
        instance(parameters),
        defaultValue
      )

      result.should.equal(value)
      verify(parameters[name]).called()

      done()
    })

    it('a decumal number', (done) => {
      const defaultValue = 99
      const value = 24.5
      const parameters = mockParameters(value)

      const result = queryStringParameterToNumber(
        name,
        instance(parameters),
        defaultValue
      )

      result.should.equal(value)
      verify(parameters[name]).called()

      done()
    })

    it('a string number', (done) => {
      const defaultValue = 99
      const value = 333
      const parameters = mockParameters(`${value}`)

      const result = queryStringParameterToNumber(
        name,
        instance(parameters),
        defaultValue
      )

      result.should.equal(value)
      verify(parameters[name]).called()

      done()
    })
  })

  describe('defaults when given', () => {
    it('undefined', (done) => {
      const defaultValue = 99
      const parameters = mockParameters(undefined)

      const result = queryStringParameterToNumber(
        name,
        instance(parameters),
        defaultValue
      )

      result.should.equal(defaultValue)
      verify(parameters[name]).called()

      done()
    })

    it('a string', (done) => {
      const defaultValue = 99
      const parameters = mockParameters('a random string')

      const result = queryStringParameterToNumber(
        name,
        instance(parameters),
        defaultValue
      )

      result.should.equal(defaultValue)
      verify(parameters[name]).called()

      done()
    })

    it('an array of integer numbers', (done) => {
      const defaultValue = 99
      const parameters = mockParameters([1, 1, 2, 78])

      const result = queryStringParameterToNumber(
        name,
        instance(parameters),
        defaultValue
      )

      result.should.equal(defaultValue)
      verify(parameters[name]).called()

      done()
    })
  })
})
