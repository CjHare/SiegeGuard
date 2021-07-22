import fs from 'fs'
import chai from 'chai'
import {instance, mock, verify, anyString} from 'ts-mockito'
import {Logger} from 'winston'
import {
  applicationBinaryInterface,
  binary
} from '../../src/fifth-dimension-security/solidity-source'
import {setLogger} from '../../src/container'

chai.should()

function setupLogger(): Logger {
  const log: Logger = mock<Logger>()
  setLogger(instance(log))
  return log
}

const solidityContractName = 'EventEmitter'
const solidityContractSourceDirectory = './contract/event-emitter/'

describe('Source loader', () => {
  describe(`loads ${solidityContractName}`, () => {
    it('abi', (done) => {
      const log = setupLogger()
      const abi = applicationBinaryInterface(solidityContractName)

      const expectedAbiJson = JSON.parse(
        load(`${solidityContractSourceDirectory}/${solidityContractName}.abi`)
      )
      const expectedAbiString = JSON.stringify(expectedAbiJson)

      abi.should.deep.equal(expectedAbiJson)
      verify(
        log.debug('Source: %s, Contents: %s', anyString(), expectedAbiString)
      ).once()
      verify(
        log.verbose(
          '%s contract ABI source: %s',
          solidityContractName,
          anyString()
        )
      ).once()

      done()
    })

    it('bin', (done) => {
      const log = setupLogger()
      const bin = binary(solidityContractName)

      const expectedBin = load(
        `${solidityContractSourceDirectory}/${solidityContractName}.bin`
      )
      bin.should.equal(expectedBin)
      verify(log.debug('Source: %s, Contents: %s', anyString(), bin)).once()
      verify(
        log.verbose(
          '%s contract binary source: %s',
          solidityContractName,
          anyString()
        )
      ).once()

      done()
    })
  })
})

function load(source: string): string {
  return fs.readFileSync(source, 'utf8').toString()
}
