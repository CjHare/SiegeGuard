import {WebsocketProviderOptions} from 'web3-core-helpers'
import {WebsocketProvider} from 'web3-providers-ws'
import {WebSocketConnectionConfiguration} from '../configuration/blockchain-connection-configuration'
import {log} from '../container'

export interface Web3WebSocketProvider {
  provider: WebsocketProvider
  hasEnded: boolean
}

interface EndedEventCallBackFunction {
  (): void
}

interface ProviderError {
  message: string
  reason: string
}

export class Web3WebSocketProviderImpl implements Web3WebSocketProvider {
  provider: WebsocketProvider
  hasEnded: boolean

  constructor(
    connectionConfig: WebSocketConnectionConfiguration,
    options: WebsocketProviderOptions,
    ended: EndedEventCallBackFunction
  ) {
    this.hasEnded = false

    // Web3js type definitions (.t.ds) are incomplete :. require() needed for providers
    /* eslint-disable @typescript-eslint/no-var-requires */
    const Web3WsProvider = require('web3-providers-ws')
    const provider = new Web3WsProvider(connectionConfig.uri(), options)
    const messagePrefix = `Blockchain WebSockets ${connectionConfig.uri()}`

    provider.on('connect', () => log.info('%s connected', messagePrefix))
    provider.on('reconnect', (details: string) =>
      log.info('%s reconnection attempt: %s', messagePrefix, details)
    )
    provider.on('error', (error: ProviderError) =>
      log.error('%s error: %s', messagePrefix, error.message)
    )
    provider.on('end', async (error: ProviderError) => {
      log.info('%s ended: %s', messagePrefix, error.reason)
      provider.reset()
      this.hasEnded = true
      ended()
    })

    this.provider = provider
  }
}
