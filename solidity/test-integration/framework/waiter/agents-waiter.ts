import {assert} from 'chai'
import {Agent} from '../../../src/contract/domain/agent/agent'
import {Agents} from '../../../src/contract/agent/agents'
import {AgentsListener} from '../../../src/contract/agent/agents-listener'
import {IntegrationTestContract} from '../integration-test-contract'
import {GanacheServer} from '../ganache-server'
import {sleep} from '../sleep'

export interface CreateFunction {
  (): Promise<void>
}

export class AgentsWaiter {
  private lastCreatedAgent: Agent | undefined

  public startListening(
    blockchain: GanacheServer,
    contract: IntegrationTestContract<Agents>
  ): void {
    const agentsListener = new AgentsListener(
      blockchain.getWs(),
      contract.get().getAddress()
    )

    this.lastCreatedAgent = undefined

    agentsListener.startCreatedAgentListening((created: Agent) => {
      this.lastCreatedAgent = created
    })
  }

  public async createAgent(contractCall: CreateFunction): Promise<Agent> {
    const previouslyCreateAgent = this.lastCreatedAgent

    await contractCall()

    while (this.lastCreatedAgent === previouslyCreateAgent) {
      await sleep(150)
    }

    if (this.lastCreatedAgent === undefined) {
      assert.fail('Failed to created an agent')
    }
    const created: Agent = this.lastCreatedAgent

    return created
  }

  public getLastCreatedAgent(): Agent | undefined {
    return this.lastCreatedAgent
  }
}
