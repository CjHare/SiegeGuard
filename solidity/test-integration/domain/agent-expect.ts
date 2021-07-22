import {assert} from 'chai'
import {expectEquals} from './expect-equals'
import {Agent} from '../../src/contract/domain/agent/agent'
import {AgentId} from '../../src/contract/domain/agent/agent-id'
import {AgentName} from '../../src/contract/domain/agent/agent-name'
import {AgentUsername} from '../../src/contract/domain/agent/agent-username'

export interface AgentComparator {
  /**
   * Deep equals evaluation of the agent against the given parameteres.
   */
  equals(id: AgentId, name: AgentName, username: AgentUsername): void
}

export function expectAgent(evaluating: Agent): AgentComparator {
  if (evaluating === undefined) {
    assert.fail('Agent is undefined')
  }

  return {
    equals(id: AgentId, name: AgentName, username: AgentUsername): void {
      expectAgentEquals(evaluating, id, name, username)
    }
  }
}

function expectAgentEquals(
  agent: Agent,
  id: AgentId,
  name: AgentName,
  username: AgentUsername
) {
  expectEquals(agent.id, id)
  expectEquals(agent.name, name)
  expectEquals(agent.username, username)
}
