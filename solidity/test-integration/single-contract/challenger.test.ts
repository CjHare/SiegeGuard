import chai, {expect} from 'chai'
import chaiAsPromised from 'chai-as-promised'
import {GanacheServer} from '../framework/ganache-server'
import {funded} from '../framework/integration-test-config'
import {IntegrationTestContract} from '../framework/integration-test-contract'
import {AccessControl} from '../../src/contract/access-control/access-control'
import {ActionId} from '../../src/contract/domain/action/action-id'
import {Challenger} from '../../src/contract/challenge/challenger'
import {ChallengeId} from '../../src/contract/domain/challenge/challenge-id'
import {ChallengeTitle} from '../../src/contract/domain/challenge/challenge-title'
import {ChallengerListener} from '../../src/contract/challenge/challenger-listener'
import {ChallengeMessage} from '../../src/contract/domain/challenge/challenge-message'
import {DeviceId} from '../../src/contract/domain/device/device-id'
import {DeviceToken} from '../../src/contract/domain/device/device-token'
import {OrganizationId} from '../../src/contract/domain/organization/organization-id'
import {PolicyId} from '../../src/contract/domain/policy/policy-id'
import {stringify} from '../../src/fifth-dimension-security/stringify'
import {sleep} from '../framework/sleep'

chai.use(chaiAsPromised)
chai.should()

const blockchain = new GanacheServer(funded)
const challenge = new IntegrationTestContract<Challenger>(blockchain)
const access = new IntegrationTestContract<AccessControl>(blockchain)

describe('Challenger contract', () => {
  describe('deployed', () => {
    let lastAction: undefined | ActionId
    let lastChallengeId: undefined | ChallengeId
    let lastOrganization: undefined | OrganizationId
    let lastPolicy: undefined | PolicyId
    let lastRecipient: undefined | DeviceId
    let lastToken: undefined | DeviceToken
    let lastTitle: undefined | ChallengeTitle
    let lastMessage: undefined | ChallengeMessage

    before(async () => {
      await access.deploy(AccessControl)
      await challenge.deploy(Challenger, access.get().getAddress().value)

      const challengeListener = new ChallengerListener(
        blockchain.getWs(),
        challenge.get().getAddress()
      )

      challengeListener.startIssueChallengeListening(
        (
          authorizingOrganization: OrganizationId,
          authorizingPolicy: PolicyId,
          authorizingAction: ActionId,
          recipient: DeviceId,
          token: DeviceToken,
          id: ChallengeId,
          title: ChallengeTitle,
          message: ChallengeMessage
        ) => {
          lastAction = authorizingAction
          lastChallengeId = id
          lastOrganization = authorizingOrganization
          lastPolicy = authorizingPolicy
          lastRecipient = recipient
          lastToken = token
          lastTitle = title
          lastMessage = message
        }
      )
    })

    it('emit challenge', async () => {
      const previous = lastChallengeId

      await challenge
        .get()
        .issue(
          organization,
          policy,
          authorizing,
          receipient,
          token,
          id,
          title,
          message
        )

      awaitChallengeIssueEvent(previous)

      expect(lastOrganization).deep.equal(organization)
      expect(lastPolicy).deep.equal(policy)
      expect(lastAction).deep.equal(authorizing)
      expect(lastRecipient).deep.equal(receipient)
      expect(lastToken).deep.equal(token)
      expect(lastChallengeId).deep.equal(id)
      expect(lastTitle).deep.equal(title)
      expect(lastMessage).deep.equal(message)
    })

    it('errors on issuing with uninitialized action id', async () => {
      const uninitializedAction = ActionId.of(uninitializedId)

      return challenge
        .get()
        .issue(
          organization,
          policy,
          uninitializedAction,
          receipient,
          token,
          id,
          title,
          message
        )
        .should.be.rejectedWith(
          uninitializedMessage(
            'actionId',
            organization,
            policy,
            uninitializedAction,
            receipient,
            token,
            id,
            title,
            message
          )
        )
    })

    it('errors on issuing with uninitialized device id', async () => {
      const uninitializedReceipient = DeviceId.of(uninitializedId)

      return challenge
        .get()
        .issue(
          organization,
          policy,
          authorizing,
          uninitializedReceipient,
          token,
          id,
          title,
          message
        )
        .should.be.rejectedWith(
          uninitializedMessage(
            'deviceId',
            organization,
            policy,
            authorizing,
            uninitializedReceipient,
            token,
            id,
            title,
            message
          )
        )
    })

    it('errors on issuing with uninitialized organization id', async () => {
      const uninitializedOrganization = OrganizationId.of(uninitializedId)

      return challenge
        .get()
        .issue(
          uninitializedOrganization,
          policy,
          authorizing,
          receipient,
          token,
          id,
          title,
          message
        )
        .should.be.rejectedWith(
          uninitializedMessage(
            'organizationId',
            uninitializedOrganization,
            policy,
            authorizing,
            receipient,
            token,
            id,
            title,
            message
          )
        )
    })

    it('errors on issuing with uninitialized policy id', async () => {
      const uninitializedPolicy = PolicyId.of(uninitializedId)

      return challenge
        .get()
        .issue(
          organization,
          uninitializedPolicy,
          authorizing,
          receipient,
          token,
          id,
          title,
          message
        )
        .should.be.rejectedWith(
          uninitializedMessage(
            'policyId',
            organization,
            uninitializedPolicy,
            authorizing,
            receipient,
            token,
            id,
            title,
            message
          )
        )
    })

    it('errors on issuing with uninitialized challenge id', async () => {
      const uninitializedChallenge = ChallengeId.of(uninitializedId)

      return challenge
        .get()
        .issue(
          organization,
          policy,
          authorizing,
          receipient,
          token,
          uninitializedChallenge,
          title,
          message
        )
        .should.be.rejectedWith(
          uninitializedMessage(
            'challengeId',
            organization,
            policy,
            authorizing,
            receipient,
            token,
            uninitializedChallenge,
            title,
            message
          )
        )
    })

    async function awaitChallengeIssueEvent(
      previous: undefined | ChallengeId
    ): Promise<void> {
      while (hasChallengeIssueEmitted(previous)) {
        await sleep(150)
      }
    }

    function hasChallengeIssueEmitted(previous: undefined | ChallengeId) {
      if (previous === undefined) {
        return lastChallengeId !== undefined
      } else {
        return (
          lastChallengeId !== undefined &&
          lastChallengeId.value === previous.value
        )
      }
    }
  })

  const organization = OrganizationId.of(BigInt(1001001))
  const policy = PolicyId.of(BigInt(990066))
  const authorizing = ActionId.of(BigInt(44446444))
  const receipient = DeviceId.of(BigInt(5))
  const token = DeviceToken.of('sdasiuyjbvdliussss')
  const id = ChallengeId.of(BigInt(33))
  const title = ChallengeTitle.of('Challenge Title')
  const message = ChallengeMessage.of('Challenge body')
  const uninitializedId = BigInt(0)
})

function uninitializedMessage(
  type: string,
  organization: OrganizationId,
  policy: PolicyId,
  authorizing: ActionId,
  receipient: DeviceId,
  token: DeviceToken,
  id: ChallengeId,
  title: ChallengeTitle,
  message: ChallengeMessage
): string {
  return `Challenger issue ( ${stringify(organization.value)}, ${stringify(
    policy.value
  )}, ${stringify(authorizing.value)}, ${stringify(
    receipient.value
  )}, ${stringify(token.value)}, ${stringify(id.value)}, ${stringify(
    title.value
  )}, ${stringify(
    message.value
  )} ) failed. Error: Returned error: VM Exception while processing transaction: revert Uninitialized ${type}`
}
