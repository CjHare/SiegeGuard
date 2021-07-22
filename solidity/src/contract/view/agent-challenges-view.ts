import {parseChallengeIds} from '../domain/serialization/challenge-id-serialization'
import {AgentId} from '../domain/agent/agent-id'
import {AuthorizedChallenge} from '../domain/challenge/authorized-challenge'
import {Challenges} from '../challenge/challenges'
import {ChallengeId} from '../domain/challenge/challenge-id'
import {DeniedChallenge} from '../domain/challenge/denied-challenge'
import {PendingChallenge} from '../domain/challenge/pending-challenge'
import {EthereumAddress} from '../../web3/domain/ethereum-address'
import {FifthDimensionSecurityWeb3} from '../../web3/fifth-dimension-security-web3'
import {SolidityContract} from '../../fifth-dimension-security/solidity-contract'
import {ContractInteractionException} from '../../exception/contract-interaction-exception'
import {stringify} from '../../fifth-dimension-security/stringify'

export class AgentChallengesView extends SolidityContract {
  private sender: EthereumAddress
  private challenges: Challenges

  constructor(
    web3: FifthDimensionSecurityWeb3,
    funded: EthereumAddress,
    contract: EthereumAddress,
    challenges: Challenges
  ) {
    super(web3, contract, AgentChallengesView.name)
    this.sender = funded
    this.challenges = challenges
  }

  public async authorizedChallengesForAgent(
    agent: AgentId
  ): Promise<AuthorizedChallenge[]> {
    const challengeIds = await this.challengesForAgent(
      agent,
      'authorizedChallengeIdsForAgent'
    ).catch((error: Error) => {
      throw error
    })
    const authorized: AuthorizedChallenge[] = new Array(challengeIds.length)

    for (let i = 0; i < authorized.length; i++) {
      authorized[i] = await this.challenges
        .getAuthorized(challengeIds[i])
        .catch((error: Error) => {
          throw error
        })
    }

    return authorized
  }

  public async deniedChallengesForAgent(
    agent: AgentId
  ): Promise<DeniedChallenge[]> {
    const challengeIds = await this.challengesForAgent(
      agent,
      'deniedChallengeIdsForAgent'
    ).catch((error: Error) => {
      throw error
    })
    const denied: DeniedChallenge[] = new Array(challengeIds.length)

    for (let i = 0; i < denied.length; i++) {
      denied[i] = await this.challenges
        .getDenied(challengeIds[i])
        .catch((error: Error) => {
          throw error
        })
    }

    return denied
  }

  public async pendingChallengesForAgent(
    agent: AgentId
  ): Promise<PendingChallenge[]> {
    const challengeIds = await this.challengesForAgent(
      agent,
      'pendingChallengeIdsForAgent'
    ).catch((error: Error) => {
      throw error
    })
    const pending: PendingChallenge[] = new Array(challengeIds.length)

    for (let i = 0; i < pending.length; i++) {
      pending[i] = await this.challenges
        .getPending(challengeIds[i])
        .catch((error: Error) => {
          throw error
        })
    }

    return pending
  }

  public async destroy(): Promise<void> {
    return super.destroy(this.sender)
  }

  private async challengesForAgent(
    agent: AgentId,
    method: string
  ): Promise<ChallengeId[]> {
    let ids: ChallengeId[] | undefined

    await this.callOneArgument(
      method,
      this.sender,
      agent.value,
      (receipt: string[]) => {
        ids = parseChallengeIds(receipt)
      }
    ).catch((error: Error) => {
      throw error
    })

    if (ids === undefined) {
      throw new ContractInteractionException(
        `${stringify(agent)} no response from ${stringify(method)}.`
      )
    }

    return ids
  }
}
