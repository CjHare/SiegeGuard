import Web3 from 'web3'
import {AbiItem} from 'web3-utils'
import {Contract} from 'web3-eth-contract'
import {HttpConnectionConfiguration} from '../configuration/blockchain-connection-configuration'
import {HttpProviderOptions} from 'web3-providers-http'
import {Web3HttpProviderImpl} from './web3-http-provider'
import {EthereumAddress} from './domain/ethereum-address'
import {log} from '../container'
import {FifthDimensionSecurityWeb3} from './fifth-dimension-security-web3'

export class FifthDimensionSecurityWeb3Http
  implements FifthDimensionSecurityWeb3
{
  private connectionConfig: HttpConnectionConfiguration
  private web3: Web3

  constructor(
    connectionConfig: HttpConnectionConfiguration,
    httpOptions: HttpProviderOptions
  ) {
    this.connectionConfig = connectionConfig

    log.info('Blockchain HTTP: %s', this.connectionConfig.uri())

    this.web3 = new Web3(
      new Web3HttpProviderImpl(this.connectionConfig, httpOptions).provider
    )
  }

  contractForDeployment(abi: AbiItem): Contract {
    return new this.web3.eth.Contract(abi)
  }

  public contract(contract: EthereumAddress, abi: AbiItem): Contract {
    return new this.web3.eth.Contract(abi, contract.value)
  }

  public getWeb3(): Web3 {
    return this.web3
  }
}
