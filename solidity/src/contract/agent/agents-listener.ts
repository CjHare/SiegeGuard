import {FifthDimensionSecurityWeb3WebSocket} from '../../web3/fifth-dimension-security-web3-ws'
import {EthereumAddress} from '../../web3/domain/ethereum-address'
import {log} from '../../container'
import {Agent} from '../domain/agent/agent'
import {AgentId} from '../domain/agent/agent-id'
import {AgentName} from '../domain/agent/agent-name'
import {AgentUsername} from '../domain/agent/agent-username'
import {Timestamp} from '../domain/time/timestamp'
import {Agents} from './agents'
import {EmittedEvent} from '../../web3/domain/emitted-event'
import {SolidityContractListener} from '../../fifth-dimension-security/solidity-contract-listener'
import {stringify} from '../../fifth-dimension-security/stringify'

interface BlockchainAgent {
  agent: {
    id: string
    name: string
    username: string
    creationDate: string
  }
}

export interface CreatedAgentHandler {
  (agent: Agent): void
}

export class AgentsListener extends SolidityContractListener {
  constructor(
    web3: FifthDimensionSecurityWeb3WebSocket,
    contract: EthereumAddress
  ) {
    super(web3, contract, Agents.name)
  }

  public startCreatedAgentListening(handler: CreatedAgentHandler): void {
    const subscribe = () => {
      return this.getContract().events.createdAgent()
    }

    const delegate = (emitted: EmittedEvent<BlockchainAgent>) => {
      log.verbose('%s event emitted from: %s', emitted.event, emitted.address)

      log.debug('Event: %s', emitted)
      log.debug('Name: %s', emitted.event)
      log.debug('Variables: %s', emitted.returnValues)

      const deflated = emitted.returnValues.agent

      const agentId = AgentId.of(BigInt(deflated.id))
      const name = AgentName.of(deflated.name)
      const username = AgentUsername.of(deflated.username)
      const creationDate = Timestamp.of(BigInt(deflated.creationDate))
      const created = Agent.of(agentId, name, username, creationDate)

      if (log.isDebugEnabled()) {
        log.debug('Agent: %s', stringify(created))
      }

      handler(created)
    }

    const eventName = `${this.getName()}.createdAgent( Agent )`

    this.startListening(eventName, subscribe, delegate)
  }
}
