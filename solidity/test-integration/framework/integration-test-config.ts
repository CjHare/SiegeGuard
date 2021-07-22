import {EthereumAddress} from '../../src/web3/domain/ethereum-address'
import {setLogger} from '../../src/container'
import {instance, mock} from 'ts-mockito'
import {maximumGasAmount} from '../../src/container'
import {Logger} from 'winston'
//const {createLogger, transports, format} = require('winston')

export const funded = EthereumAddress.of(
  '0xFE3B557E8Fb62b89F4916B721be55cEb828dBd73'
)
export const nonAddress = EthereumAddress.of(
  '0x0000000000000000000000000000000000000000'
)

/*
export function setupConsoleLogger() {
const log = createLogger({
  level: 'debug',
  format: format.combine(
    format.timestamp(),
    format.errors({stack: true}),
    format.splat(),
    format.json()
  ),
  transports: [
new transports.Console()
  ]
})

  setLogger(log)
}

setupConsoleLogger()
*/

export function setupMockLogger(): Logger {
  const log: Logger = mock<Logger>()
  setLogger(instance(log))
  return log
}

setupMockLogger()

/*
class EthEventsTransactionGasCostConsoleLogger {
  public log(message: string) {
    if (message.startsWith('eth') || message.startsWith(' ')) {
      console.log(message)
    }
  }
}
*/

export const serverOptions = {
  accounts: [
    {
      secretKey:
        '0x8f2a55949038a9610f50fb23b5883af3b4ecb3c3bb792cbcefbd1542c692be63',
      balance: '0xad78ebc5ac6200000'
    }
  ],
  debug: true,
  ws: true,
  gasLimit: `${maximumGasAmount}`,
  gasPrice: '0',
  allowUnlimitedContractSize: true,
  //  logger: new EthEventsTransactionGasCostConsoleLogger(),
  vmErrorsOnRPCResponse: true
}

/** In-memory test server options */
export const wsOptions = {
  timeout: 2000, // ms

  clientConfig: {
    keepalive: true,
    keepaliveInterval: 100 // ms
  },

  reconnect: {
    auto: true,
    delay: 250, // ms
    maxAttempts: 5,
    onTimeout: true
  }
}

export const httpOptions = {
  keepAlive: true,
  withCredentials: false,
  timeout: 1000, // ms
  headers: [
    {
      name: 'Access-Control-Allow-Origin',
      value: '*'
    }
  ]
}
