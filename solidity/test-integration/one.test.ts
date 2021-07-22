import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'
import {AccessControl} from '../src/contract/access-control/access-control'
import {Actions} from '../src/contract/action/actions'
import {ActionsWaiter} from './framework/waiter/actions-waiter'
import {Agents} from '../src/contract/agent/agents'
import {AgentId} from '../src/contract/domain/agent/agent-id'
import {AgentName} from '../src/contract/domain/agent/agent-name'
import {AgentUsername} from '../src/contract/domain/agent/agent-username'
import {AgentsWaiter} from './framework/waiter/agents-waiter'
import {Challenger} from '../src/contract/challenge/challenger'
import {Challenges} from '../src/contract/challenge/challenges'
import {ChallengeTitle} from '../src/contract/domain/challenge/challenge-title'
import {ChallengeMessage} from '../src/contract/domain/challenge/challenge-message'
import {ChallengesWaiter} from './framework/waiter/challenges-waiter'
import {DeviceName} from '../src/contract/domain/device/device-name'
import {DeviceToken} from '../src/contract/domain/device/device-token'
import {DeviceId} from '../src/contract/domain/device/device-id'
import {Devices} from '../src/contract/device/devices'
import {DevicesWaiter} from './framework/waiter/devices-waiter'
import {Organization} from '../src/contract/organization/organization'
import {Organizations} from '../src/contract/organization/organizations'
import {Policy} from '../src/contract/policy/policy'
import {Policies} from '../src/contract/policy/policies'
import {PolicyTitle} from '../src/contract/domain/policy/policy-title'
import {GanacheServer} from './framework/ganache-server'
import {funded} from './framework/integration-test-config'
import {IntegrationTestContract} from './framework/integration-test-contract'

/*import {ActionId} from '../src/contract/domain/action/action-id'
import {PolicyId} from '../src/contract/domain/policy/policy-id'
import {OrganizationId} from '../src/contract/domain/organization/organization-id'*/

chai.use(chaiAsPromised)
chai.should()

const blockchain = new GanacheServer(funded)

const actions = new IntegrationTestContract<Actions>(blockchain)
const access = new IntegrationTestContract<AccessControl>(blockchain)
const agents = new IntegrationTestContract<Agents>(blockchain)
const challenger = new IntegrationTestContract<Challenger>(blockchain)
const challenges = new IntegrationTestContract<Challenges>(blockchain)
const devices = new IntegrationTestContract<Devices>(blockchain)
const organization = new IntegrationTestContract<Organization>(blockchain)
const organizations = new IntegrationTestContract<Organizations>(blockchain)
const policy = new IntegrationTestContract<Policy>(blockchain)
const policies = new IntegrationTestContract<Policies>(blockchain)

const actionsWaiter = new ActionsWaiter()
const agentsWaiter = new AgentsWaiter()
const challengesWaiter = new ChallengesWaiter()
const devicesWaiter = new DevicesWaiter()

describe('End to end', () => {
  before(async () => {
    await access.deploy(AccessControl)
    await agents.deploy(Agents, access.get().getAddress().value)
    await challenger.deploy(Challenger, access.get().getAddress().value)
    await devices.deploy(Devices, access.get().getAddress().value)
    await organizations.deploy(Organizations, access.get().getAddress().value)
    await policies.deploy(Policies, access.get().getAddress().value)
    await organization.deploy(
      Organization,
      access.get().getAddress().value,
      policies.get().getAddress().value,
      'IT Organization'
    )
    await challenges.deploy(
      Challenges,
      access.get().getAddress().value,
      challenger.get().getAddress().value
    )
    await actions.deploy(
      Actions,
      access.get().getAddress().value,
      challenges.get().getAddress().value
    )
    await policy.deploy(
      Policy,
      access.get().getAddress().value,
      actions.get().getAddress().value,
      devices.get().getAddress().value,
      policyTitle.value
    )

    await access.get().addAdmin(actions.get().getAddress())
    await access.get().addAdmin(challenges.get().getAddress())
    await access.get().addAdmin(organization.get().getAddress())
    await access.get().addAdmin(organizations.get().getAddress())
    await access.get().addAdmin(policies.get().getAddress())

    actionsWaiter.startListening(blockchain, actions)
    agentsWaiter.startListening(blockchain, agents)
    devicesWaiter.startListening(blockchain, devices)
    challengesWaiter.startListening(blockchain, challenges)
  })

  it('Create three agents', async () => {
    const first = await agentsWaiter.createAgent(async () =>
      agents.get().create(AgentName.of('Agent alpha'), AgentUsername.of('001'))
    )
    const second = await agentsWaiter.createAgent(async () =>
      agents.get().create(AgentName.of('Agent beta'), AgentUsername.of('002'))
    )
    const third = await agentsWaiter.createAgent(async () =>
      agents.get().create(AgentName.of('Agent gamma'), AgentUsername.of('003'))
    )

    first.id.should.deep.equal(firstAgent)
    second.id.should.deep.equal(secondAgent)
    return third.id.should.deep.equal(thirdAgent)
  })

  it('Create three devices', async () => {
    const first = await devicesWaiter.create(async () =>
      devices
        .get()
        .create(
          firstAgent,
          DeviceName.of('Device uno'),
          DeviceToken.of('aaaaaaaBBBBBBBcccccc')
        )
    )
    const second = await devicesWaiter.create(async () =>
      devices
        .get()
        .create(
          secondAgent,
          DeviceName.of('Device dos'),
          DeviceToken.of('eeeeeeeeBBBBBBBffffffff')
        )
    )
    const third = await devicesWaiter.create(async () =>
      devices
        .get()
        .create(
          thirdAgent,
          DeviceName.of('Device tres'),
          DeviceToken.of('zzzzzzzzzBBBBBBBoooooooo')
        )
    )

    first.id.should.deep.equal(firstDevice)
    second.id.should.deep.equal(secondDevice)
    return third.id.should.deep.equal(thirdDevice)
  })

  it('Initialize the organization', async () => {
    return organizations.get().add(organization.get().getAddress())
  })

  it('Initialize the MVP policy', async () => {
    await access.get().addAdmin(policy.get().getAddress())

    await policy
      .get()
      .initChallenge(
        challengeTitle,
        challengeMessage,
        approverIds,
        approvalsRequired,
        timeoutSeconds
      )

    return organization.get().addPolicy(policy.get().getAddress())
  })

  it('challenge', async () => {
    //    const policyId = await policy.get().getPolicyId()

    //    return organization.get().startAuthorization(policyId)

    return policy.get().startAuthorization()

    /*
const policyId =           PolicyId.of(BigInt(1))
const pendingAction = await  actionsWaiter.create( async() => actions.get().createPending(policyId))

      return actions
        .get()
        .createPendingChallenge(
          OrganizationId.of(BigInt(1)),
          policyId,
          pendingAction.id,
          DeviceId.of(BigInt(1)),
          DeviceToken.of('first token'),
          ChallengeTitle.of('Important commands requested'),
          ChallengeMessage.of('You have been challenged - respond!')
        )
*/
  })

  const policyTitle = PolicyTitle.of('A very special IT policy')
  const challengeTitle = ChallengeTitle.of(
    'Attention please, you are challenged'
  )
  const challengeMessage = ChallengeMessage.of(
    'You can choose to approve or deny'
  )
  const firstAgent = AgentId.of(BigInt(1))
  const secondAgent = AgentId.of(BigInt(2))
  const thirdAgent = AgentId.of(BigInt(3))
  const approverIds: bigint[] = [
    firstAgent.value,
    secondAgent.value,
    thirdAgent.value
  ]
  const approvalsRequired = 2
  const timeoutSeconds = BigInt(30)
  const firstDevice = DeviceId.of(BigInt(1))
  const secondDevice = DeviceId.of(BigInt(2))
  const thirdDevice = DeviceId.of(BigInt(3))
})
