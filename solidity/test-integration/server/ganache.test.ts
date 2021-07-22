import chai, {expect} from 'chai'
import chaiAsPromised from 'chai-as-promised'
import ganache from 'ganache-core'
import {FifthDimensionSecurityWeb3WebSocket} from '../../src/web3/fifth-dimension-security-web3-ws'
import {wsOptions} from '../framework/integration-test-config'
import {AddressInfo} from 'net'
import {WebSocketConnectionConfiguration} from '../../src/configuration/blockchain-connection-configuration'

chai.use(chaiAsPromised)
chai.should()

const server = ganache.server()

describe('Integration Test Framework', () => {
  describe('In-memory blockchain (Ganache)', () => {
    before((done) => {
      server.listen(() => {
        expect(server.address()).is.not.undefined
        expect(server.address()).is.not.null
        done()
      })
    })

    after((done) => {
      server.close(() => {
        expect(server.address()).is.null
        done()
      })
    })

    it('starts up', async (done) => {
      expect(server.address()).is.not.undefined
      expect(server.address()).is.not.null

      done()
    })

    it('has WS address', async (done) => {
      expect(server.address()).is.not.undefined
      expect(server.address()).is.not.null

      const web3 = new FifthDimensionSecurityWeb3WebSocket(
        ganacheUriConfig(server.address()),
        wsOptions,
        () => {} // eslint-disable-line @typescript-eslint/no-empty-function
      )

      web3.resetWebSocket()

      done()
    })
  })
})

function ganacheUriConfig(
  address: AddressInfo | string | null
): WebSocketConnectionConfiguration {
  if ((<AddressInfo>address).port !== undefined) {
    const port = (<AddressInfo>address).port

    return {
      host: 'localhost',
      port: port,
      uri: () => `ws://localhost:` + port
    }
  }

  throw new Error('Server address is not of type AddressInfo')
}
