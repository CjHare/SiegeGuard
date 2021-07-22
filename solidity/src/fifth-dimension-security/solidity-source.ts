/**
 * Retrieves the smart contract binaries and interfaces from their data source for use with the blockchain.
 */
import fs from 'fs'
import {AbiItem} from 'web3-utils'
import {log} from '../container'
import {
  solidityAbiFile,
  solidityBinaryFile
} from '../configuration/solidity-source-mapping'

export function binary(contractName: string): string {
  const contractBinaryFile = solidityBinaryFile.get(contractName)

  if (contractBinaryFile === undefined) {
    throw new Error(`${contractName} has no mapped BIN source`)
  }

  log.verbose('%s contract binary source: %s', contractName, contractBinaryFile)

  return load(contractBinaryFile)
}

export function applicationBinaryInterface(contractName: string): AbiItem {
  const contractInterfaceFile = solidityAbiFile.get(contractName)

  if (contractInterfaceFile === undefined) {
    throw new Error(`${contractName} has no mapped ABI source`)
  }

  log.verbose('%s contract ABI source: %s', contractName, contractInterfaceFile)

  return JSON.parse(load(contractInterfaceFile))
}

function load(source: string): string {
  const contents = fs.readFileSync(source, 'utf8').toString()

  log.debug('Source: %s, Contents: %s', source, contents)

  return contents
}
