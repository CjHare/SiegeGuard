import chai, {assert, expect} from 'chai'
import chaiAsPromised from 'chai-as-promised'
import {GanacheServer} from '../framework/ganache-server'
import {funded} from '../framework/integration-test-config'
import {IntegrationTestContract} from '../framework/integration-test-contract'
import {AccessControl} from '../../src/contract/access-control/access-control'
import {Actions} from '../../src/contract/action/actions'
import {ActionId} from '../../src/contract/domain/action/action-id'
import {AgentId} from '../../src/contract/domain/agent/agent-id'
import {ActionsWaiter} from '../framework/waiter/actions-waiter'
import {ChallengeId} from '../../src/contract/domain/challenge/challenge-id'
import {ChallengeMessage} from '../../src/contract/domain/challenge/challenge-message'
import {ChallengeTitle} from '../../src/contract/domain/challenge/challenge-title'
import {Challenger} from '../../src/contract/challenge/challenger'
import {Challenges} from '../../src/contract/challenge/challenges'
import {ChallengesWaiter} from '../framework/waiter/challenges-waiter'
import {DeviceId} from '../../src/contract/domain/device/device-id'
import {DeviceToken} from '../../src/contract/domain/device/device-token'

import {OrganizationId} from '../../src/contract/domain/organization/organization-id'
import {PolicyId} from '../../src/contract/domain/policy/policy-id'
import {
  argumentNotFound,
  contractNotDeployed,
  connectionError,
  uninitializedArgument
} from '../framework/error-messages'
import {stringify} from '../../src/fifth-dimension-security/stringify'

chai.use(chaiAsPromised)
chai.should()

const blockchain = new GanacheServer(funded)
const actions = new IntegrationTestContract<Actions>(blockchain)
const access = new IntegrationTestContract<AccessControl>(blockchain)
const challenger = new IntegrationTestContract<Challenger>(blockchain)
const challenges = new IntegrationTestContract<Challenges>(blockchain)

const actionsWaiter = new ActionsWaiter()
const challengesWaiter = new ChallengesWaiter()

describe('Actions contract', () => {
  describe('no blockchain connection', () => {
    it('errors on get last challenge id', async () => {
      return actions
        .blockchainStopped(Actions)
        .lastActionId()
        .should.be.rejectedWith(connectionError())
    })
  })

  describe('not deployed', () => {
    it('errors on get last challenge id', async () => {
      return actions
        .notDeployed(Actions)
        .lastActionId()
        .should.be.rejectedWith(contractNotDeployed())
    })
  })

  describe('deployed', () => {
    before(async () => {
      await access.deploy(AccessControl)
      await challenger.deploy(Challenger, access.get().getAddress().value)
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

      await access.get().addAdmin(challenges.get().getAddress())
      await access.get().addAdmin(actions.get().getAddress())

      actionsWaiter.startListening(blockchain, actions)
      challengesWaiter.startListening(blockchain, challenges)
    })

    it('create pending action', async () => {
      const previous = actionsWaiter.getLastPendingCreated()
      expect(previous).is.undefined

      const created = await actionsWaiter.create(async () =>
        actions.get().createPending(policy)
      )

      return created.should.not.deep.equal(previous)
    })

    it('create pending action increments last action id', async () => {
      const countBefore = (await actions.get().lastActionId()).value

      await actionsWaiter.create(
        async () => await actions.get().createPending(policy)
      )

      const countAfter = (await actions.get().lastActionId()).value

      return assert(
        countAfter > countBefore,
        'Expecting the count after to be larger then the count before'
      )
    })

    it('get pending action', async () => {
      const id = actionsWaiter.lastPendingActionId()

      const retrieved = await actions.get().getPending(id)

      return retrieved.should.deep.equal(actionsWaiter.getLastPendingCreated())
    })

    it('create two pending challenges', async () => {
      const action = (
        await actions.get().getPending(actionsWaiter.lastPendingActionId())
      ).id

      await actions
        .get()
        .createPendingChallenge(
          organization,
          policy,
          action,
          agent,
          firstDevice,
          firstToken,
          title,
          message
        )
      await actions
        .get()
        .createPendingChallenge(
          organization,
          policy,
          action,
          agent,
          secondDevice,
          secondToken,
          title,
          message
        )

      const after = await actions
        .get()
        .getPending(actionsWaiter.lastPendingActionId())
      after.pendingChallenges[0].should.deep.equal(firstChallengeId)
      after.pendingChallenges[1].should.deep.equal(secondChallengeId)
      return after.pendingChallenges.length.should.equal(2)
    })

    it('authorize the first pending challenge', async () => {
      const before = await actions
        .get()
        .getPending(actionsWaiter.lastPendingActionId())
      assert(
        before.pendingChallenges.length == 2,
        'Expecting two pending challenges'
      )

      await actions.get().authorizePendingChallenge(before.id, firstChallengeId)

      const after = await actions.get().getPending(before.id)
      expect(after.pendingChallenges).is.not.undefined
      after.pendingChallenges.length.should.equal(1)
      expect(after.deniedChallenges).is.not.undefined
      after.deniedChallenges.length.should.equal(0)
      expect(after.authorizedChallenges).is.not.undefined
      after.authorizedChallenges.length.should.equal(1)
      return after.authorizedChallenges[0].should.deep.equal(firstChallengeId)
    })

    it('deny the second pending challenge', async () => {
      const before = await actions
        .get()
        .getPending(actionsWaiter.lastPendingActionId())
      assert(
        before.pendingChallenges.length == 1,
        'Expecting one pending challenge'
      )

      await actions.get().denyPendingChallenge(before.id, secondChallengeId)

      const after = await actions.get().getPending(before.id)
      expect(after.pendingChallenges).is.not.undefined
      after.pendingChallenges.length.should.equal(0)
      expect(after.authorizedChallenges).is.not.undefined
      after.authorizedChallenges.length.should.equal(1)
      expect(after.deniedChallenges).is.not.undefined
      after.deniedChallenges.length.should.equal(1)
      return after.deniedChallenges[0].should.deep.equal(secondChallengeId)
    })

    it('errors on authorizing an already authorized challenge', async () => {
      const before = await actions
        .get()
        .getPending(actionsWaiter.lastPendingActionId())
      assert(
        before.pendingChallenges.length == 0,
        'Expecting no pending challenges'
      )

      return actions
        .get()
        .authorizePendingChallenge(before.id, secondChallengeId)
        .should.be.rejectedWith(
          authorizePendingChallengeNotFound(before.id, secondChallengeId)
        )
    })

    it('errors on denying an already denied challenge', async () => {
      const before = await actions
        .get()
        .getPending(actionsWaiter.lastPendingActionId())
      assert(
        before.pendingChallenges.length == 0,
        'Expecting no pending challenges'
      )

      return actions
        .get()
        .denyPendingChallenge(before.id, firstChallengeId)
        .should.be.rejectedWith(
          denyPendingChallengeNotFound(before.id, firstChallengeId)
        )
    })

    it('errors on deny a non-existant pending challenge', async () => {
      const before = await actions
        .get()
        .getPending(actionsWaiter.lastPendingActionId())
      assert(
        before.pendingChallenges.length == 0,
        'Expecting no pending challenges'
      )
      const challengeId = ChallengeId.of(BigInt(5000))

      return actions
        .get()
        .denyPendingChallenge(before.id, challengeId)
        .should.be.rejectedWith(
          denyPendingChallengeNotFound(before.id, challengeId)
        )
    })

    it('errors on get uninitialized pending action', async () => {
      return actions
        .get()
        .getPending(uninitializedActionId)
        .should.be.rejectedWith(
          pendingActionIdUninitialized(uninitializedActionId)
        )
    })

    it('errors on get non-existant pending action', async () => {
      return actions
        .get()
        .getPending(nonExistentId)
        .should.be.rejectedWith(pendingActionNotFound(nonExistentId))
    })

    it('deny action', async () => {
      const pending = await actionsWaiter.create(async () =>
        actions.get().createPending(policy)
      )

      const denied = await actionsWaiter.deny(async () =>
        actions.get().deny(pending.id)
      )

      return pending.should.not.deep.equal(denied)
    })

    it('get denied action', async () => {
      const id = actionsWaiter.lastDeniedActionId()

      const retrieved = await actions.get().getDenied(id)

      return retrieved.should.deep.equal(actionsWaiter.getLastDeniedCreated())
    })

    it('errors on get uninitialized denied action', async () => {
      return actions
        .get()
        .getDenied(uninitializedActionId)
        .should.be.rejectedWith(
          deniedActionIdUninitialized(uninitializedActionId)
        )
    })

    it('errors on get non-existant denied action', async () => {
      return actions
        .get()
        .getDenied(nonExistentId)
        .should.be.rejectedWith(deniedActionNotFound(nonExistentId))
    })

    it('authorize action', async () => {
      const pending = await actionsWaiter.create(async () =>
        actions.get().createPending(policy)
      )

      const authorized = await actionsWaiter.authorize(async () =>
        actions.get().authorize(pending.id)
      )

      return pending.should.not.deep.equal(authorized)
    })

    it('get authorized action', async () => {
      const id = actionsWaiter.lastAuthorizedActionId()

      const retrieved = await actions.get().getAuthorized(id)

      return retrieved.should.deep.equal(
        actionsWaiter.getLastAuthorizedCreated()
      )
    })

    it('errors on get uninitialized authorized action', async () => {
      return actions
        .get()
        .getAuthorized(uninitializedActionId)
        .should.be.rejectedWith(
          authorizedActionIdUninitialized(uninitializedActionId)
        )
    })

    it('errors on get non-existant authorized action', async () => {
      return actions
        .get()
        .getAuthorized(nonExistentId)
        .should.be.rejectedWith(authorizedActionNotFound(nonExistentId))
    })

    it('remove pending action', async () => {
      const id = (
        await actionsWaiter.create(async () =>
          actions.get().createPending(policy)
        )
      ).id

      await actions.get().remove(id)

      return actions
        .get()
        .getPending(id)
        .should.be.rejectedWith(pendingActionNotFound(id))
    })

    it('remove authorize actiond', async () => {
      const id = actionsWaiter.lastAuthorizedActionId()

      await actions.get().remove(id)

      return actions
        .get()
        .getAuthorized(id)
        .should.be.rejectedWith(authorizedActionNotFound(id))
    })

    it('remove denied action', async () => {
      const id = actionsWaiter.lastDeniedActionId()

      await actions.get().remove(id)

      return actions
        .get()
        .getDenied(id)
        .should.be.rejectedWith(deniedActionNotFound(id))
    })

    it('errors on remove with an uninitialized challenge id', async () => {
      return actions
        .get()
        .remove(uninitializedActionId)
        .should.be.rejectedWith(
          removeActionIdUninitialized(uninitializedActionId)
        )
    })

    it('destroy when populated', async () => {
      await assertPendingChallengeCountGreaterThanZero()

      await actions.get().destroy()

      return actions
        .notDeployed(Actions)
        .lastActionId()
        .should.be.rejectedWith(contractNotDeployed())
    })
  })

  const organization = OrganizationId.of(BigInt(44))
  const policy = PolicyId.of(BigInt(55))
  const uninitializedActionId = ActionId.of(BigInt(0))
  const agent = AgentId.of(BigInt(454))
  const nonExistentId = ActionId.of(BigInt(100))
  const firstChallengeId = ChallengeId.of(BigInt(1))
  const secondChallengeId = ChallengeId.of(BigInt(2))
  const message = ChallengeMessage.of('You have been challenged - respond!')
  const title = ChallengeTitle.of('Important commands requested')
  const firstDevice = DeviceId.of(BigInt(443355))
  const firstToken = DeviceToken.of('first token')
  const secondDevice = DeviceId.of(BigInt(773377))
  const secondToken = DeviceToken.of('second token')
})

async function assertPendingChallengeCountGreaterThanZero() {
  const count = (await actions.get().lastActionId()).value
  assert(
    count > BigInt(0),
    'Expecting the Pending Challenge count to be greater than zero'
  )
}

function removeActionIdUninitialized(id: ActionId): string {
  return uninitializedArgument(
    'Actions',
    actions.contract.getAddress(),
    'remove',
    'actionId',
    id.value
  )
}

function authorizedActionIdUninitialized(id: ActionId): string {
  return uninitializedArgument(
    'Actions',
    actions.contract.getAddress(),
    'getAuthorized',
    'actionId',
    id.value
  )
}

function deniedActionIdUninitialized(id: ActionId): string {
  return uninitializedArgument(
    'Actions',
    actions.contract.getAddress(),
    'getDenied',
    'actionId',
    id.value
  )
}

function pendingActionIdUninitialized(id: ActionId): string {
  return uninitializedArgument(
    'Actions',
    actions.contract.getAddress(),
    'getPending',
    'actionId',
    id.value
  )
}

function authorizedActionNotFound(id: ActionId): string {
  return argumentNotFound(
    'Actions',
    actions.contract.getAddress(),
    'getAuthorized',
    id.value
  )
}

function pendingActionNotFound(id: ActionId): string {
  return argumentNotFound(
    'Actions',
    actions.contract.getAddress(),
    'getPending',
    id.value
  )
}

function deniedActionNotFound(id: ActionId): string {
  return argumentNotFound(
    'Actions',
    actions.contract.getAddress(),
    'getDenied',
    id.value
  )
}

function authorizePendingChallengeNotFound(
  action: ActionId,
  challenge: ChallengeId
): string {
  return `Actions @ ${
    actions.contract.getAddress().value
  } authorizePendingChallenge ( ${stringify(action.value)}, ${stringify(
    challenge.value
  )} ) failed. Error: Returned error: VM Exception while processing transaction: revert Expecting to have found the index of the Pending Challenge`
}

function denyPendingChallengeNotFound(
  action: ActionId,
  challenge: ChallengeId
): string {
  return `Actions @ ${
    actions.contract.getAddress().value
  } denyPendingChallenge ( ${stringify(action.value)}, ${stringify(
    challenge.value
  )} ) failed. Error: Returned error: VM Exception while processing transaction: revert Expecting to have found the index of the Pending Challenge`
}
