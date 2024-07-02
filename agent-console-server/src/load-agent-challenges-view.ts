import {
  AgentChallengesView,
  EthereumAddress,
  FifthDimensionSecurityWeb3Http,
  Organization
} from '@just_another_developer/solidity'
import {loadChallenges} from './load-challenges'

export async function loadAgentChallengesView(
  organizations: Map<bigint, Organization>,
  web3: FifthDimensionSecurityWeb3Http,
  funded: EthereumAddress
): Promise<Map<bigint, AgentChallengesView>> {
  const mapping = new Map<bigint, AgentChallengesView>()

  organizations.forEach(async (organization: Organization, key: bigint) => {
    const viewAddress = await organization
      .getAgentChallengeViewAddress()
      .catch((error: Error) => {
        throw error
      })

    const challenges = await loadChallenges(organization, web3, funded).catch(
      (error: Error) => {
        throw error
      }
    )

    mapping.set(
      key,
      new AgentChallengesView(web3, funded, viewAddress, challenges)
    )
  })

  return mapping
}
