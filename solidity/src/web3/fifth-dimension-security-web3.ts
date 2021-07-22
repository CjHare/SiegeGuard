import {AbiItem} from 'web3-utils'
import {Contract} from 'web3-eth-contract'
import {EthereumAddress} from './domain/ethereum-address'
import Web3 from 'web3'

export interface FifthDimensionSecurityWeb3 {
  contract(contract: EthereumAddress, abi: AbiItem): Contract
  contractForDeployment(abi: AbiItem): Contract

  // TODO restrict access to what is actually used - getTransactionRecipt
  getWeb3(): Web3
}
