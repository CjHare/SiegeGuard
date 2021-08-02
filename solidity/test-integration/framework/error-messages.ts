import {stringify} from '../../src/fifth-dimension-security/stringify'
import {EthereumAddress} from '../../src/web3/domain/ethereum-address'

/**
 * The message string to expect when you're giving an argument that is unitialized.
 */
export function uninitializedArgument<T>(
  contract: string,
  address: EthereumAddress,
  method: string,
  name: string,
  value: T
): string {
  return `${contract} @ ${address.value} ${method} ( ${stringify(
    value
  )} ) failed. Error: Returned error: VM Exception while processing transaction: revert Uninitialized ${name}`
}

export function uninitializedArgumentTwoParameters<T, U>(
  contract: string,
  address: EthereumAddress,
  method: string,
  name: string,
  first: T,
  second: U
): string {
  return `${contract} @ ${address.value} ${method} ( ${stringify(
    first
  )}, ${stringify(
    second
  )} ) failed. Error: Returned error: VM Exception while processing transaction: revert ${name}.value is uninitialized`
}

export function contractNotDeployed(): string {
  return "Error: Returned values aren't valid, did it run Out of Gas? You might also see this error if you are not using the correct ABI for the contract you are retrieving data from, requesting data from a block number that does not exist, or querying a node which is not fully synced."
}

export function connectionError(): string {
  return "Error: CONNECTION ERROR: Couldn't connect to node localhost:1000."
}

export function argumentNotFound(
  contract: string,
  address: EthereumAddress,
  method: string,
  id: bigint
): string {
  return `${contract} @ ${address.value} ${method} ( ${stringify(
    id
  )} ) failed. Error: ${contract} ${method} ( ${id} ) failed to retrun a value.`
}
