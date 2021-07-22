import chai, {assert, expect} from 'chai'
import chaiAsPromised from 'chai-as-promised'
import {GanacheServer} from '../framework/ganache-server'
import {funded} from '../framework/integration-test-config'
import {IntegrationTestContract} from '../framework/integration-test-contract'
import {AccessControl} from '../../src/contract/access-control/access-control'
import {ActionId} from '../../src/contract/domain/action/action-id'
import {AgentId} from '../../src/contract/domain/agent/agent-id'
import {Challenger} from '../../src/contract/challenge/challenger'
import {Challenges} from '../../src/contract/challenge/challenges'
import {DeviceId} from '../../src/contract/domain/device/device-id'
import {DeviceToken} from '../../src/contract/domain/device/device-token'
import {ChallengeId} from '../../src/contract/domain/challenge/challenge-id'
import {ChallengeTitle} from '../../src/contract/domain/challenge/challenge-title'
import {ChallengeMessage} from '../../src/contract/domain/challenge/challenge-message'
import {ChallengesWaiter} from '../framework/waiter/challenges-waiter'
import {OrganizationId} from '../../src/contract/domain/organization/organization-id'
import {PolicyId} from '../../src/contract/domain/policy/policy-id'
import {
  argumentNotFound,
  contractNotDeployed,
  connectionError,
  uninitializedArgument
} from '../framework/error-messages'

chai.use(chaiAsPromised)
chai.should()

const blockchain = new GanacheServer(funded)
const challenger = new IntegrationTestContract<Challenger>(blockchain)
const challenges = new IntegrationTestContract<Challenges>(blockchain)
const access = new IntegrationTestContract<AccessControl>(blockchain)
const challengesWaiter = new ChallengesWaiter()

describe('Challenges contract', () => {
  describe('no blockchain connection', () => {
    it('errors on get last challenge id', async () => {
      return challenges
        .blockchainStopped(Challenges)
        .lastChallengeId()
        .should.be.rejectedWith(connectionError())
    })
  })

  describe('not deployed', () => {
    it('errors on get last challenge id', async () => {
      return challenges
        .notDeployed(Challenges)
        .lastChallengeId()
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
      await access.get().addAdmin(challenges.get().getAddress())

      challengesWaiter.startListening(blockchain, challenges)
    })

    it('create pending challenge', async () => {
      const previous = challengesWaiter.getLastPendingCreated()
      expect(previous).is.undefined

      const created = await challengesWaiter.create(async () =>
        challenges
          .get()
          .createPending(
            organization,
            policy,
            agent,
            authorizing,
            recipient,
            token,
            title,
            message
          )
      )

      return created.should.not.deep.equal(previous)
    })

    it('create pending challenge increments last challenge id', async () => {
      const countBefore = await challenges.get().lastChallengeId()

      await challengesWaiter.create(async () =>
        challenges
          .get()
          .createPending(
            organization,
            policy,
            agent,
            authorizing,
            recipient,
            token,
            title,
            message
          )
      )

      const countAfter = await challenges.get().lastChallengeId()

      return assert(
        countAfter.value > countBefore.value,
        'Expecting the count after to be larger then the count before'
      )
    })

    it('get pending challenge', async () => {
      const id = challengesWaiter.lastPendingChallengeId()

      const retrieved = await challenges.get().getPending(id)

      return retrieved.should.deep.equal(
        challengesWaiter.getLastPendingCreated()
      )
    })

    it('errors on get uninitialized pending challenge', async () => {
      return challenges
        .get()
        .getPending(uninitializedChallengeId)
        .should.be.rejectedWith(
          pendingChallengeIdUninitialized(uninitializedChallengeId)
        )
    })

    it('errors on get non-existant pending challenge', async () => {
      return challenges
        .get()
        .getPending(nonExistentId)
        .should.be.rejectedWith(pendingChallengeNotFound(nonExistentId))
    })

    it('deny challenge', async () => {
      const pending = await challengesWaiter.create(async () =>
        challenges
          .get()
          .createPending(
            organization,
            policy,
            agent,
            authorizing,
            recipient,
            token,
            title,
            message
          )
      )

      const denied = await challengesWaiter.deny(async () =>
        challenges.get().deny(pending.challengeId)
      )

      return pending.should.not.deep.equal(denied)
    })

    it('get denied challenge', async () => {
      const id = challengesWaiter.lastDeniedChallengeId()

      const retrieved = await challenges.get().getDenied(id)

      return retrieved.should.deep.equal(
        challengesWaiter.getLastDeniedCreated()
      )
    })

    it('errors on get uninitialized denied challenge', async () => {
      return challenges
        .get()
        .getDenied(uninitializedChallengeId)
        .should.be.rejectedWith(
          deniedChallengeIdUninitialized(uninitializedChallengeId)
        )
    })

    it('errors on get non-existant denied challenge', async () => {
      return challenges
        .get()
        .getDenied(nonExistentId)
        .should.be.rejectedWith(deniedChallengeNotFound(nonExistentId))
    })

    it('authorize challenge', async () => {
      const pending = await challengesWaiter.create(async () =>
        challenges
          .get()
          .createPending(
            organization,
            policy,
            agent,
            authorizing,
            recipient,
            token,
            title,
            message
          )
      )

      const authorized = await challengesWaiter.authorize(async () =>
        challenges.get().authorize(pending.challengeId)
      )

      return pending.should.not.deep.equal(authorized)
    })

    it('get authorized challenge', async () => {
      const id = challengesWaiter.lastAuthorizedChallengeId()

      const retrieved = await challenges.get().getAuthorized(id)

      return retrieved.should.deep.equal(
        challengesWaiter.getLastAuthorizedCreated()
      )
    })

    it('errors on get uninitialized authorized challenge', async () => {
      return challenges
        .get()
        .getAuthorized(uninitializedChallengeId)
        .should.be.rejectedWith(
          authorizedChallengeIdUninitialized(uninitializedChallengeId)
        )
    })

    it('errors on get non-existant authorized challenge', async () => {
      return challenges
        .get()
        .getAuthorized(nonExistentId)
        .should.be.rejectedWith(authorizedChallengeNotFound(nonExistentId))
    })

    it('remove pending challenge', async () => {
      const id = (
        await challengesWaiter.create(async () =>
          challenges
            .get()
            .createPending(
              organization,
              policy,
              agent,
              authorizing,
              recipient,
              token,
              title,
              message
            )
        )
      ).challengeId

      await challenges.get().remove(id)

      return challenges
        .get()
        .getPending(id)
        .should.be.rejectedWith(pendingChallengeNotFound(id))
    })

    it('remove authorized challenge', async () => {
      const id = challengesWaiter.lastAuthorizedChallengeId()

      await challenges.get().remove(id)

      return challenges
        .get()
        .getAuthorized(id)
        .should.be.rejectedWith(authorizedChallengeNotFound(id))
    })

    it('remove denied challenge', async () => {
      const id = challengesWaiter.lastDeniedChallengeId()

      await challenges.get().remove(id)

      return challenges
        .get()
        .getDenied(id)
        .should.be.rejectedWith(deniedChallengeNotFound(id))
    })

    it('errors on remove with an uninitialized challenge id', async () => {
      return challenges
        .get()
        .remove(uninitializedChallengeId)
        .should.be.rejectedWith(
          removeChallengeIdUninitialized(uninitializedChallengeId)
        )
    })

    it('destroy when populated', async () => {
      await assertPendingChallengeCountGreaterThanZero()

      await challenges.get().destroy()

      return challenges
        .notDeployed(Challenges)
        .lastChallengeId()
        .should.be.rejectedWith(contractNotDeployed())
    })
  })

  const organization = OrganizationId.of(BigInt(121))
  const policy = PolicyId.of(BigInt(55))
  const authorizing = ActionId.of(BigInt(4))
  const agent = AgentId.of(BigInt(22))
  const recipient = DeviceId.of(BigInt(300))
  const token = DeviceToken.of('sdasdasdasoooo')
  const title = ChallengeTitle.of('A very important title')
  const message = ChallengeMessage.of('Super secret message')
  const uninitializedChallengeId = ChallengeId.of(BigInt(0))
  const nonExistentId = ChallengeId.of(BigInt(100))
})

async function assertPendingChallengeCountGreaterThanZero() {
  const count = (await challenges.get().lastChallengeId()).value
  assert(
    count > BigInt(0),
    'Expecting the Pending Challenge count to be greater than zero'
  )
}

function removeChallengeIdUninitialized(id: ChallengeId): string {
  return uninitializedArgument('Challenges', 'remove', 'challengeId', id.value)
}

function authorizedChallengeIdUninitialized(id: ChallengeId): string {
  return uninitializedArgument(
    'Challenges',
    'getAuthorized',
    'challengeId',
    id.value
  )
}

function deniedChallengeIdUninitialized(id: ChallengeId): string {
  return uninitializedArgument(
    'Challenges',
    'getDenied',
    'challengeId',
    id.value
  )
}

function pendingChallengeIdUninitialized(id: ChallengeId): string {
  return uninitializedArgument(
    'Challenges',
    'getPending',
    'challengeId',
    id.value
  )
}

function authorizedChallengeNotFound(id: ChallengeId): string {
  return argumentNotFound('Challenges', 'getAuthorized', id.value)
}

function pendingChallengeNotFound(id: ChallengeId): string {
  return argumentNotFound('Challenges', 'getPending', id.value)
}

function deniedChallengeNotFound(id: ChallengeId): string {
  return argumentNotFound('Challenges', 'getDenied', id.value)
}
