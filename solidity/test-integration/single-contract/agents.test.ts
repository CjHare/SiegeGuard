import chai, {assert} from 'chai'
import chaiAsPromised from 'chai-as-promised'
import {GanacheServer} from '../framework/ganache-server'
import {funded} from '../framework/integration-test-config'
import {IntegrationTestContract} from '../framework/integration-test-contract'
import {AccessControl} from '../../src/contract/access-control/access-control'
import {Agents} from '../../src/contract/agent/agents'
import {AgentId} from '../../src/contract/domain/agent/agent-id'
import {AgentName} from '../../src/contract/domain/agent/agent-name'
import {AgentUsername} from '../../src/contract/domain/agent/agent-username'
import {AgentsWaiter} from '../framework/waiter/agents-waiter'
import {expectAgent} from '../domain/agent-expect'
import {
  argumentNotFound,
  contractNotDeployed,
  connectionError,
  uninitializedArgument
} from '../framework/error-messages'

chai.use(chaiAsPromised)
chai.should()

const blockchain = new GanacheServer(funded)
const agents = new IntegrationTestContract<Agents>(blockchain)
const access = new IntegrationTestContract<AccessControl>(blockchain)
const agentsWaiter = new AgentsWaiter()

describe('Agents contract', () => {
  describe('no blockchain connection', () => {
    it('errors on get agent with id 1', async () => {
      return agents
        .blockchainStopped(Agents)
        .get(firstAgentId)
        .should.be.rejectedWith(connectionError())
    })
  })

  describe('not deployed', () => {
    it('errors on get agent with id 1', async () => {
      return agents
        .notDeployed(Agents)
        .get(firstAgentId)
        .should.be.rejectedWith(contractNotDeployed())
    })
  })

  describe('deployed', () => {
    before(async () => {
      await access.deploy(AccessControl)
      await agents.deploy(Agents, access.get().getAddress().value)

      agentsWaiter.startListening(blockchain, agents)
    })

    it('create agent', async () => {
      const nextId = (await agents.get().lastAgentId()) + BigInt(1)
      const nextAgentId = AgentId.of(BigInt(nextId))

      const created = await agentsWaiter.createAgent(async () =>
        agents.get().create(name, username)
      )

      return expectAgent(created).equals(nextAgentId, name, username)
    })

    it('create agent increases lastAgentId', async () => {
      const countBefore = await agents.get().lastAgentId()

      await agentsWaiter.createAgent(async () =>
        agents.get().create(name, username)
      )

      const countAfter = await agents.get().lastAgentId()

      return assert(
        countAfter > countBefore,
        'Expecting the count after to be larger then the count before'
      )
    })

    it('get created agent by id', async () => {
      const created = await agentsWaiter.createAgent(async () =>
        agents.get().create(name, username)
      )

      const agent = await agents.get().get(created.id)

      return agent.should.deep.equal(agentsWaiter.getLastCreatedAgent())
    })

    it('errors on uninitialized agent id', async () => {
      return agents
        .get()
        .get(uninitializedAgentId)
        .should.be.rejectedWith(agentIdUninitialized(uninitializedAgentId))
    })

    it('errors on get non-existent agent id', async () => {
      const id = AgentId.of(BigInt(100))

      return agents.get().get(id).should.be.rejectedWith(agentNotFound(id))
    })

    it('remove created agent by id', async () => {
      const created = await agentsWaiter.createAgent(async () =>
        agents.get().create(name, username)
      )

      await agents.get().remove(created.id)

      return agents
        .get()
        .get(created.id)
        .should.be.rejectedWith(agentNotFound(created.id))
    })

    it('destroy when partially populated', async () => {
      await assertAgentCountGreaterThanZero()

      await agents.get().destroy()

      return agents
        .get()
        .lastAgentId()
        .should.be.rejectedWith(contractNotDeployed())
    })
  })

  const firstAgentId = AgentId.of(BigInt(1))
  const uninitializedAgentId = AgentId.of(BigInt(0))
  const name = AgentName.of('firsty, sencondy names')
  const username = AgentUsername.of('cOmp4ny-user-n4m3')
})

function agentIdUninitialized(id: AgentId): string {
  return uninitializedArgument('Agents', 'get', 'agentId', id.value)
}

function agentNotFound(id: AgentId): string {
  return argumentNotFound('Agents', 'get', id.value)
}

async function assertAgentCountGreaterThanZero() {
  const count = await agents.get().lastAgentId()
  assert(count > BigInt(0), 'Expecting the Agent count to be greater than zero')
}
