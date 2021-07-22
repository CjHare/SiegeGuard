import {Agent} from '../domain/agent/agent'
import {AgentId} from '../domain/agent/agent-id'
import {AgentName} from '../domain/agent/agent-name'
import {AgentUsername} from '../domain/agent/agent-username'
import {Timestamp} from '../domain/time/timestamp'
import {EthereumAddress} from '../../web3/domain/ethereum-address'
import {FifthDimensionSecurityWeb3} from '../../web3/fifth-dimension-security-web3'
import {SolidityContract} from '../../fifth-dimension-security/solidity-contract'
import {ContractInteractionException} from '../../exception/contract-interaction-exception'
import {stringify} from '../../fifth-dimension-security/stringify'

interface BlockchainAgent {
  id: string
  name: string
  username: string
  creationDate: string
}

export class Agents extends SolidityContract {
  private sender: EthereumAddress

  constructor(
    web3: FifthDimensionSecurityWeb3,
    funded: EthereumAddress,
    contract: EthereumAddress
  ) {
    super(web3, contract, Agents.name)
    this.sender = funded
  }

  public async create(name: AgentName, username: AgentUsername): Promise<void> {
    return this.sendTwoArguments(
      'create',
      this.sender,
      name.value,
      username.value,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      (_: Record<string, unknown>) => {
        this.logContract('created Agent', {
          name: name.value,
          username: username.value
        })
      }
    )
  }

  public async lastAgentId(): Promise<bigint> {
    let agentCount: bigint | undefined

    await this.call('lastAgentId', this.sender, (receipt: string) => {
      agentCount = BigInt(receipt)
    }).catch((error: Error) => {
      throw error
    })

    if (agentCount === undefined) {
      throw new ContractInteractionException(
        `${Agents.name} lastAgentId () failed to retrun a value.`
      )
    }

    return agentCount
  }

  public async get(id: AgentId): Promise<Agent> {
    let agent: Agent | undefined

    await this.callOneArgument(
      'get',
      this.sender,
      id.value,
      (receipt: BlockchainAgent) => {
        if (receipt.id == '0') {
          throw new ContractInteractionException(
            `${Agents.name} get ( ${id.value} ) failed to retrun a value.`
          )
        }
        const agentId = AgentId.of(BigInt(receipt.id))
        const name = AgentName.of(receipt.name)
        const username = AgentUsername.of(receipt.username)
        const creationDate = Timestamp.of(BigInt(receipt.creationDate))

        agent = Agent.of(agentId, name, username, creationDate)
      }
    ).catch((error: Error) => {
      throw error
    })

    if (agent === undefined) {
      throw new ContractInteractionException(
        `${stringify(id)} has no mapped Agent.`
      )
    }

    return agent
  }

  public async remove(id: AgentId): Promise<void> {
    return this.sendOneArgument(
      'remove',
      this.sender,
      id.value,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      (_: Record<string, unknown>) => {
        this.logContract('removed Agent', {id: id.value})
      }
    )
  }

  public async destroy(): Promise<void> {
    return super.destroy(this.sender)
  }
}
