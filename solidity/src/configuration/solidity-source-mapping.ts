/**
 * Maps the solidity wrapper class name to abi and bin file locations.
 */
import path from 'path'

export const solidityAbiFile = new Map()
export const solidityBinaryFile = new Map()

const contractRootDirectory = `../../contract`

/** Event Emitter is a test contract */
add(`${contractRootDirectory}/event-emitter/EventEmitter`, 'EventEmitter')

/** 5DS SeigeGuard contracts - System */
add(
  `${contractRootDirectory}/access-control/HierarchicalAccessControl`,
  'AccessControl'
)
add(
  `${contractRootDirectory}/domain-name-system/DomainNameSystem`,
  'DomainNameSystem'
)

/** 5DS SeigeGuard contracts - Singleton / injectable */
add(`${contractRootDirectory}/challenge/ChallengerEmitter`, 'Challenger')

/** 5DS SeigeGuard contracts - Organizational */
add(`${contractRootDirectory}/action/mvp/MvpActions`, 'Actions')
add(`${contractRootDirectory}/agent/mvp/MvpAgents`, 'Agents')
add(`${contractRootDirectory}/challenge/mvp/MvpChallenges`, 'Challenges')
add(`${contractRootDirectory}/device/mvp/MvpDevices`, 'Devices')
add(`${contractRootDirectory}/policy/mvp/MvpPolicy`, 'Policy')
add(`${contractRootDirectory}/policy/mvp/MvpPolicies`, 'Policies')
add(`${contractRootDirectory}/organization/mvp/MvpOrganization`, 'Organization')
add(
  `${contractRootDirectory}/organization/mvp/MvpOrganizations`,
  'Organizations'
)

/** 5DS SeigeGuard contracts - Organizational Views */
add(
  `${contractRootDirectory}/challenge/mvp/MvpChallenges`,
  'AgentChallengesView'
)

/**
 * Resolves the absolute paths for the abi and bin files, keyed to the contract name into the exported Maps.
 *
 * @param contractPath relative path to the file omitting the extension (assuming the abi and bin have the same name).
 * @param contractName name of the contract, which matches the file name.
 */
function add(contractPath: string, contractName: string) {
  solidityAbiFile.set(
    contractName,
    path.resolve(__dirname, `${contractPath}.abi`)
  )
  solidityBinaryFile.set(
    contractName,
    path.resolve(__dirname, `${contractPath}.bin`)
  )
}
