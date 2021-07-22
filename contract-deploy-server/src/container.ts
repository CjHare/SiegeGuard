/**
 * Container managing creation of objects, a box to store singleton instances in.
 */
import {
  HttpConnectionConfiguration,
  EthereumAddress,
  FifthDimensionSecurityWeb3Http,
  httpOptions,
  setLogger as setSolidityLogger
} from '@just_another_developer/solidity'
import {
  setLogger as setServerLogger,
  setAccessLogger as setServerAcessLogger
} from '@just_another_developer/common-server'
import {funded} from '../config/ethereum-accounts'
import {accessLog, log as logger} from '../config/logger'

export const log = logger

const blockchainUriConfig: HttpConnectionConfiguration = {
  host: 'localhost',
  port: 18546,
  uri: () => `http://localhost:18545`
}

setSolidityLogger(log)
setServerLogger(log)
setServerAcessLogger(accessLog)

export const web3 = new FifthDimensionSecurityWeb3Http(
  blockchainUriConfig,
  httpOptions
)
export const sender = ethereumAddress(funded)

function ethereumAddress(account: string): EthereumAddress {
  try {
    return EthereumAddress.of(account)
  } catch (error: unknown) {
    log.error('Container initialisation failed, %s', error)
    process.exit(9)
  }
}
