import Web3 from 'web3'
import {AbiItem} from 'web3-utils'
import {Contract} from 'web3-eth-contract'
import {WebSocketConnectionConfiguration} from '../configuration/blockchain-connection-configuration'
import {
  Web3WebSocketProvider,
  Web3WebSocketProviderImpl
} from './web3-websocket-provider'
import {WebsocketProviderOptions} from 'web3-core-helpers'
import {EthereumAddress} from './domain/ethereum-address'
import {FifthDimensionSecurityWeb3} from './fifth-dimension-security-web3'
import {log} from '../container'

interface ResetWebSocketConnection {
  (): void
}

export class FifthDimensionSecurityWeb3WebSocket
  implements FifthDimensionSecurityWeb3 {
  private connectionConfig: WebSocketConnectionConfiguration
  private web3: Web3
  private provider: Web3WebSocketProvider
  private options: WebsocketProviderOptions
  private reset: ResetWebSocketConnection

  constructor(
    connectionConfig: WebSocketConnectionConfiguration,
    wsOptions: WebsocketProviderOptions,
    reset: ResetWebSocketConnection
  ) {
    this.connectionConfig = connectionConfig
    this.options = wsOptions
    this.reset = reset

    log.info('Blockchain WebSocket: %s', this.connectionConfig.uri())

    this.provider = new Web3WebSocketProviderImpl(
      this.connectionConfig,
      wsOptions,
      reset
    )
    this.web3 = new Web3(this.provider.provider)
  }

  public resetWebSocket(): void {
    if (this.provider.hasEnded) {
      this.provider = new Web3WebSocketProviderImpl(
        this.connectionConfig,
        this.options,
        this.reset
      )
      this.web3.setProvider(this.provider.provider)
    }
  }

  public contract(contract: EthereumAddress, abi: AbiItem): Contract {
    return new this.web3.eth.Contract(abi, contract.value)
  }

  public contractForDeployment(abi: AbiItem): Contract {
    return new this.web3.eth.Contract(abi)
  }

  public contractForEventListening(
    contract: EthereumAddress,
    abi: AbiItem
  ): Contract {
    return new this.web3.eth.Contract(abi, contract.value)
  }

  public getWeb3(): Web3 {
    return this.web3
  }
}
