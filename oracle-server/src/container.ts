/**
 * Container managing creation of objects, a box to store singleton instances in.
 */
import {
  ChallengerListener,
  DomainNameSystem,
  WebSocketConnectionConfiguration,
  EthereumAddress,
  FifthDimensionSecurityWeb3WebSocket,
  wsOptions,
  setLogger as setSolidityLogger,
  Challenger,
  DomainName
} from '@just_another_developer/solidity'
import {
  setLogger as setServerLogger,
  setAccessLogger as setServerAcessLogger
} from '@just_another_developer/common-server'
import {dnsAddress, funded} from '../config/ethereum-accounts'
import {accessLog, log as logger} from '../config/logger'
import {logChallengerEvent} from './handler/log-challenger-event'

export const log = logger

const blockchainUriConfig: WebSocketConnectionConfiguration = {
  host: 'localhost',
  port: 18546,
  uri: () => 'ws://localhost:18546'
}

setSolidityLogger(log)
setServerLogger(log)
setServerAcessLogger(accessLog)

export const web3 = new FifthDimensionSecurityWeb3WebSocket(
  blockchainUriConfig,
  wsOptions,
  resetWebSocket
)
export const sender = ethereumAddress(funded)

const dns = new DomainNameSystem(web3, sender, ethereumAddress(dnsAddress))

export async function challenger(): Promise<ChallengerListener> {
  return await dns
    .lookup(DomainName.of(Challenger.name))
    .then((address: EthereumAddress) => new ChallengerListener(web3, address))
    .catch((error: Error) => {
      log.error(error)
      process.exit(9)
    })
}

function ethereumAddress(account: string): EthereumAddress {
  try {
    return EthereumAddress.of(account)
  } catch (error: unknown) {
    log.error('Container initialisation failed, %s', error)
    process.exit(9)
  }
}

function resetWebSocket(): void {
  web3.resetWebSocket()
}

challenger()
  .then((challenges: ChallengerListener) => {
    challenges.startIssueChallengeListening(logChallengerEvent)
  })
  .catch((error: Error) => log.error(error))
