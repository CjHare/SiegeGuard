import {Contract, SendOptions} from 'web3-eth-contract'
import {ContractDeploymentException} from '../exception/contract-deployment-exception'
import {binary} from './solidity-source'
import {EthereumAddress} from '../web3/domain/ethereum-address'
import {log} from '../container'

export async function deployContract(
  contractName: string,
  contract: Contract,
  sender: EthereumAddress,
  // Web3js typemapping uses any[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  additionalParams?: any[]
): Promise<EthereumAddress> {
  const evmCode = binary(contractName)

  return estimateGas(contractName, contract, evmCode, additionalParams).then(
    (gas: number) => {
      return deploy(
        contractName,
        contract,
        evmCode,
        sender,
        aboveMinimumGas(gas),
        additionalParams
      )
    }
  )
}

async function deploy(
  contractName: string,
  contract: Contract,
  evmCode: string,
  sender: EthereumAddress,
  aboveMinimumGas: number,
  // Web3js typemapping uses any[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  additionalParams?: any[]
): Promise<EthereumAddress> {
  const getGasCostOptions: SendOptions = {
    from: sender.value,
    gas: aboveMinimumGas
  }
  log.debug(
    '%s contract deploy with custom options: %s, additional parameters: %s',
    contractName,
    getGasCostOptions,
    additionalParams
  )

  const contractDeployment = async (): Promise<string> => {
    return await contract
      .deploy({data: evmCode, arguments: additionalParams})
      .send(getGasCostOptions)
      .on('transactionHash', (transactionHash) =>
        log.verbose(
          `%s contract deploy transaction hash: %s`,
          contractName,
          transactionHash
        )
      )
      .on('receipt', (receipt) =>
        log.debug(
          '%s contract deploy receipt: %s',
          contractName,
          JSON.stringify(receipt)
        )
      )
      .then((result: Contract) => {
        const address = result.options.address

        log.debug(
          '%s contract interface: %s',
          contractName,
          JSON.stringify(result.options.jsonInterface)
        )

        if (result.options.address === undefined) {
          throw new ContractDeploymentException(
            `${contractName} contract address was undefined`
          )
        }

        log.info('%s contract deployed: %s', contractName, address)

        return address
      })
  }

  return EthereumAddress.of(
    await contractDeployment().catch((error: Error) => {
      throw new ContractDeploymentException(
        `${contractName} contract deployment failed: ${error.message}`
      )
    })
  )
}

async function estimateGas(
  contractName: string,
  contract: Contract,
  evmCode: string,
  // Web3js typemapping uses any[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  additionalParams?: any
): Promise<number> {
  additionalParams = additionalParams || []

  log.debug(
    '%s contract deployment gas estimation, additional params: %s',
    contractName,
    additionalParams
  )

  const estimate = async (): Promise<number> => {
    return await contract
      .deploy({data: evmCode, arguments: additionalParams})
      .estimateGas()
      .then((gas: number) => {
        log.verbose(
          '%s contract deployment gas estimate: %s',
          contractName,
          gas
        )
        return gas
      })
  }

  return await estimate().catch((error: Error) => {
    throw new ContractDeploymentException(
      `${contractName} contract gas estimation failed: ${error.message}`
    )
  })
}

/**
 * Account for any miscalculation in gas required by the node.
 *
 * @param minimumGas minimum amount of gas calculated by the node for the contract deployment.
 */
function aboveMinimumGas(minimumGas: number): number {
  return Math.trunc(minimumGas * 1.2)
}
