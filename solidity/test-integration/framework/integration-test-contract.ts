import {expect} from 'chai'
import {IntegrationTestBlockchain} from './integration-test-blockchain'
import {SolidityContract} from '../../src/fifth-dimension-security/solidity-contract'
import {FifthDimensionSecurityWeb3} from '../../src/web3/fifth-dimension-security-web3'
import {EthereumAddress} from '../../src/web3/domain/ethereum-address'
import {funded, nonAddress} from './integration-test-config'
import {FifthDimensionSecurityWeb3Http} from '../../src/web3/fifth-dimension-security-web3-http'
import {httpOptions} from '../../src/configuration/web3-provider-configuration'

export class IntegrationTestContract<T extends SolidityContract> {
  server: IntegrationTestBlockchain
  contract!: T

  constructor(server: IntegrationTestBlockchain) {
    this.server = server
  }

  public async deploy(
    type: {
      new (
        web3: FifthDimensionSecurityWeb3,
        funded: EthereumAddress,
        contract: EthereumAddress
      ): T
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ...additionalParams: any[]
  ): Promise<void> {
    await this.server
      .deploy(type, additionalParams)
      .then((deployed: T) => {
        this.contract = deployed
      })
      .catch((error: Error) => {
        throw error
      })

    expect(this.contract).is.not.undefined
  }

  public get(): T {
    expect(this.contract).is.not.undefined
    return this.contract
  }

  public notDeployed(type: {
    new (
      web3: FifthDimensionSecurityWeb3,
      funded: EthereumAddress,
      contract: EthereumAddress
    ): T
  }): T {
    return this.server.unaddressed(type)
  }

  public blockchainStopped(type: {
    new (
      web3: FifthDimensionSecurityWeb3,
      funded: EthereumAddress,
      contract: EthereumAddress
    ): T
  }): T {
    return new type(
      new FifthDimensionSecurityWeb3Http(
        {host: 'localhost', port: 1000, uri: () => 'localhost:1000'},
        httpOptions
      ),
      funded,
      nonAddress
    )
  }
}
