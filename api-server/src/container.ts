/**
 * Container managing creation of objects, a box to store singleton instances in.
 */
import {
  DomainNameSystem,
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
import {dnsAddress, funded} from '../config/ethereum-accounts'
import {accessLog, log as logger} from '../config/logger'
import {loadOrganizations} from './load-organizations'

export const log = logger

setSolidityLogger(log)
setServerLogger(log)
setServerAcessLogger(accessLog)

const blockchainUriConfig: HttpConnectionConfiguration = {
  host: 'localhost',
  port: 18545,
  uri: () => `http://localhost:18545`
}

export const web3 = new FifthDimensionSecurityWeb3Http(
  blockchainUriConfig,
  httpOptions
)
export const sender = ethereumAddress(funded)

const dns = new DomainNameSystem(web3, sender, ethereumAddress(dnsAddress))

export const organizations = loadOrganizations(dns, web3, sender, log)

function ethereumAddress(account: string): EthereumAddress {
  try {
    return EthereumAddress.of(account)
  } catch (error: unknown) {
    log.error('Container initialisation failed, %s', error)
    process.exit(9)
  }
}
