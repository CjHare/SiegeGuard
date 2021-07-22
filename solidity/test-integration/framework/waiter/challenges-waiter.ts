import {assert} from 'chai'
import {AuthorizedChallenge} from '../../../src/contract/domain/challenge/authorized-challenge'
import {Challenges} from '../../../src/contract/challenge/challenges'
import {ChallengesListener} from '../../../src/contract/challenge/challenges-listener'
import {ChallengeId} from '../../../src/contract/domain/challenge/challenge-id'
import {DeniedChallenge} from '../../../src/contract/domain/challenge/denied-challenge'
import {IntegrationTestContract} from '../integration-test-contract'
import {GanacheServer} from '../ganache-server'
import {PendingChallenge} from '../../../src/contract/domain/challenge/pending-challenge'
import {sleep} from '../../framework/sleep'

export interface CreateFunction {
  (): Promise<void>
}

export interface AuthorizeFunction {
  (): Promise<void>
}

export interface DenyFunction {
  (): Promise<void>
}

export class ChallengesWaiter {
  private lastAuthorized: undefined | AuthorizedChallenge
  private lastDenied: undefined | DeniedChallenge
  private lastPending: undefined | PendingChallenge

  public startListening(
    blockchain: GanacheServer,
    contract: IntegrationTestContract<Challenges>
  ): void {
    const challengesListener = new ChallengesListener(
      blockchain.getWs(),
      contract.get().getAddress()
    )

    challengesListener.startCreatedAuthorizedChallengeListening(
      (challenge: AuthorizedChallenge) => {
        this.lastAuthorized = challenge
      }
    )

    challengesListener.startCreatedDeniedChallengeListening(
      (challenge: DeniedChallenge) => {
        this.lastDenied = challenge
      }
    )

    challengesListener.startCreatedPendingChallengeListening(
      (challenge: PendingChallenge) => {
        this.lastPending = challenge
      }
    )
  }

  public getLastPendingCreated(): undefined | PendingChallenge {
    return this.lastPending
  }

  public getLastAuthorizedCreated(): undefined | AuthorizedChallenge {
    return this.lastAuthorized
  }

  public getLastDeniedCreated(): undefined | DeniedChallenge {
    return this.lastDenied
  }

  public lastPendingChallengeId(): ChallengeId {
    if (this.lastPending === undefined) {
      assert.fail(
        'Expecting last pending challenge to be populated, but it is undefined'
      )
    }

    return this.lastPending.challengeId
  }

  public lastDeniedChallengeId(): ChallengeId {
    if (this.lastDenied === undefined) {
      assert.fail(
        'Expecting last denied challenge to be populated, but it is undefined'
      )
    }

    return this.lastDenied.challengeId
  }

  public lastAuthorizedChallengeId(): ChallengeId {
    if (this.lastAuthorized === undefined) {
      assert.fail(
        'Expecting last authorized challenge to be populated, but it is undefined'
      )
    }

    return this.lastAuthorized.challengeId
  }

  public async create(contractCall: CreateFunction): Promise<PendingChallenge> {
    const previous = this.lastPending

    contractCall()

    while (this.lastPending === previous) {
      await sleep(150)
    }

    if (this.lastPending === undefined) {
      assert.fail('Failed to created a pending challenge')
    }
    const created: PendingChallenge = this.lastPending

    return created
  }

  public async authorize(
    contractCall: AuthorizeFunction
  ): Promise<AuthorizedChallenge> {
    const previous = this.lastAuthorized

    contractCall()

    while (this.lastAuthorized === previous) {
      await sleep(150)
    }

    if (this.lastAuthorized === undefined) {
      assert.fail('Failed to created a authorized challenge')
    }
    const created: AuthorizedChallenge = this.lastAuthorized

    return created
  }

  public async deny(contractCall: DenyFunction): Promise<DeniedChallenge> {
    const previous = this.lastDenied

    contractCall()

    while (this.lastDenied === previous) {
      await sleep(150)
    }

    if (this.lastDenied === undefined) {
      assert.fail('Failed to created a denied challenge')
    }
    const created: DeniedChallenge = this.lastDenied

    return created
  }
}
