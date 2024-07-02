import {
  Challenges,
  EthereumAddress,
  FifthDimensionSecurityWeb3Http,
  Organization
} from '@just_another_developer/solidity'

export async function loadChallenges(
  organization: Organization,
  web3: FifthDimensionSecurityWeb3Http,
  funded: EthereumAddress
): Promise<Challenges> {
  return organization
    .getChallengesAddress()
    .then((address: EthereumAddress) => new Challenges(web3, funded, address))
    .catch((error: Error) => {
      throw error
    })
}
