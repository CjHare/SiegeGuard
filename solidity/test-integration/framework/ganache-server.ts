import chai, {expect} from 'chai'
import chaiAsPromised from 'chai-as-promised'
import ganache from 'ganache-core'
import {AddressInfo} from 'net'
import {serverOptions, wsOptions, httpOptions} from './integration-test-config'
import {EthereumAddress} from '../../src/web3/domain/ethereum-address'
import {FifthDimensionSecurityWeb3WebSocket} from '../../src/web3/fifth-dimension-security-web3-ws'
import {FifthDimensionSecurityWeb3Http} from '../../src/web3/fifth-dimension-security-web3-http'
import {WebSocketConnectionConfiguration} from '../../src/configuration/blockchain-connection-configuration'
import {IntegrationTestBlockchain} from './integration-test-blockchain'
import {FifthDimensionSecurityWeb3} from '../../src/web3/fifth-dimension-security-web3'

chai.use(chaiAsPromised)

export class GanacheServer extends IntegrationTestBlockchain {
  private ws!: FifthDimensionSecurityWeb3WebSocket
  private http!: FifthDimensionSecurityWeb3Http

  private server: ganache.Server

  constructor(funded: EthereumAddress) {
    super(funded)
    this.server = ganache.server(serverOptions)

    this.addStartupHook()
    this.addTearDownHook()
  }

  protected getWeb3(): FifthDimensionSecurityWeb3 {
    expect(this.http).is.not.undefined
    return this.http
  }

  public getWs(): FifthDimensionSecurityWeb3WebSocket {
    expect(this.ws).is.not.undefined
    return this.ws
  }

  public getHttp(): FifthDimensionSecurityWeb3Http {
    expect(this.http).is.not.undefined
    return this.http
  }

  /**
   * The before hook to setup the Ganache blockchain integration test server.
   */
  private addStartupHook(): void {
    before((done) => {
      this.server.listen(() => {
        expect(this.server.address()).is.not.undefined
        expect(this.server.address()).is.not.null

        this.ws = new FifthDimensionSecurityWeb3WebSocket(
          this.ganacheWsConfig(this.server.address()),
          wsOptions,
          () => {
            this.resetWebSocket()
          }
        )

        this.http = new FifthDimensionSecurityWeb3Http(
          this.ganacheHttpConfig(this.server.address()),
          httpOptions
        )

        done()
      })
    })
  }

  private resetWebSocket(): void {
    expect(this.ws).is.not.undefined
    this.ws.resetWebSocket()
  }

  /**
   * The after hook to stop the Ganache blockchain integration test server.
   */
  private addTearDownHook() {
    after((done) => {
      this.server.close(() => {
        expect(this.server.address()).is.null
        done()
      })
    })
  }

  private ganacheWsConfig(
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

  private ganacheHttpConfig(
    address: AddressInfo | string | null
  ): WebSocketConnectionConfiguration {
    if ((<AddressInfo>address).port !== undefined) {
      const port = (<AddressInfo>address).port

      return {
        host: 'localhost',
        port: port,
        uri: () => `http://localhost:` + port
      }
    }

    throw new Error('Server address is not of type AddressInfo')
  }
}
