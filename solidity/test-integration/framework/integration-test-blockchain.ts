import {EthereumAddress} from '../../src/web3/domain/ethereum-address'
import {SolidityContract} from '../../src/fifth-dimension-security/solidity-contract'
import {deploy as deployContract} from '../../src/fifth-dimension-security/solidity-deploy'
import {FifthDimensionSecurityWeb3} from '../../src/web3/fifth-dimension-security-web3'
import {nonAddress} from './integration-test-config'

export abstract class IntegrationTestBlockchain {
  private funded: EthereumAddress

  constructor(funded: EthereumAddress) {
    this.funded = funded
  }

  /**
   * Deploys to the blockchain, returning the created (addressed) contract.
   */
  public async deploy<T extends SolidityContract>(
    type: {
      new (
        web3: FifthDimensionSecurityWeb3,
        funded: EthereumAddress,
        contract: EthereumAddress
      ): T
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    additionalParams?: any[]
  ): Promise<T> {
    return await deployContract(
      this.getWeb3(),
      this.funded,
      type,
      additionalParams
    )
      .then((deployedContract: T) => {
        return deployedContract
      })
      .catch((error: Error) => {
        throw error
      })
  }

  /**
   * Creates a contract instance that is not deployed i.e. address at zero (undeployable contract address)
   */
  public unaddressed<T extends SolidityContract>(type: {
    new (
      web3: FifthDimensionSecurityWeb3,
      funded: EthereumAddress,
      contract: EthereumAddress
    ): T
  }): T {
    return new type(this.getWeb3(), this.funded, nonAddress)
  }

  protected abstract getWeb3(): FifthDimensionSecurityWeb3
}
