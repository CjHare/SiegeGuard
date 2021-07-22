import {EthereumAddress} from '../web3/domain/ethereum-address'
import {deployContract} from './solidity-deploy-contract'
import {FifthDimensionSecurityWeb3} from '../web3/fifth-dimension-security-web3'
import {applicationBinaryInterface} from './solidity-source'
import {SolidityContract} from './solidity-contract'

export async function deploy<T extends SolidityContract>(
  web3: FifthDimensionSecurityWeb3,
  sender: EthereumAddress,
  type: {
    new (
      web3: FifthDimensionSecurityWeb3,
      funded: EthereumAddress,
      contract: EthereumAddress
    ): T
  },
  // Web3js typemapping uses any[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  additionalParams?: any[]
): Promise<T> {
  const abi = applicationBinaryInterface(type.name)
  const contract = web3.contractForDeployment(abi)
  const contractAccount = await deployContract(
    type.name,
    contract,
    sender,
    additionalParams
  )

  return new type(web3, sender, contractAccount)
}
