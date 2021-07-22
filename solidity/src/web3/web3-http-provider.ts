import {HttpProvider, HttpProviderOptions} from 'web3-providers-http'
import {HttpConnectionConfiguration} from '../configuration/blockchain-connection-configuration'

export interface Web3HttpProvider {
  provider: HttpProvider
}

export class Web3HttpProviderImpl implements Web3HttpProvider {
  provider: HttpProvider

  constructor(
    connectionConfig: HttpConnectionConfiguration,
    options: HttpProviderOptions
  ) {
    this.provider = this.createHttpProvider(connectionConfig, options)
  }

  private createHttpProvider(
    connectionConfig: HttpConnectionConfiguration,
    options: HttpProviderOptions
  ): HttpProvider {
    // Web3js type definitions (.t.ds) are incomplete :. require() needed for providers
    /* eslint-disable @typescript-eslint/no-var-requires */
    const Web3HttpProvider = require('web3-providers-http')
    return new Web3HttpProvider(connectionConfig.uri(), options)
  }
}
