/**
 * Container managing creation of objects, a box to store singleton instances in.
 */
import {
  DomainNameSystem,
  HttpConnectionConfiguration,
  EthereumAddress,
  FifthDimensionSecurityWeb3Http,
  httpOptions,
  Organization,
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

const blockchainUriConfig: HttpConnectionConfiguration = {
  host: 'localhost',
  port: 18545,
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

const dns = new DomainNameSystem(web3, sender, ethereumAddress(dnsAddress))
export let organizations: Map<bigint, Organization>

function ethereumAddress(account: string): EthereumAddress {
  try {
    return EthereumAddress.of(account)
  } catch (error: unknown) {
    log.error('Container initialisation failed, %s', error)
    process.exit(9)
  }
}

const load = async () => {
  organizations = await loadOrganizations(dns, web3, sender)
}

//TODO this load does not force the thread to wait, farms loading to a worker thread
load().catch((error: Error) => {
  log.error('Loading Organizations, %s', error)
  process.exit(9)
})
