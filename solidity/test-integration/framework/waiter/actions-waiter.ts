import {assert} from 'chai'
import {AuthorizedAction} from '../../../src/contract/domain/action/authorized-action'
import {Actions} from '../../../src/contract/action/actions'
import {ActionsListener} from '../../../src/contract/action/actions-listener'
import {ActionId} from '../../../src/contract/domain/action/action-id'
import {DeniedAction} from '../../../src/contract/domain/action/denied-action'
import {IntegrationTestContract} from '../integration-test-contract'
import {GanacheServer} from '../ganache-server'
import {PendingAction} from '../../../src/contract/domain/action/pending-action'
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

export class ActionsWaiter {
  private lastAuthorized: undefined | AuthorizedAction
  private lastDenied: undefined | DeniedAction
  private lastPending: undefined | PendingAction

  public startListening(
    blockchain: GanacheServer,
    contract: IntegrationTestContract<Actions>
  ): void {
    const actionsListener = new ActionsListener(
      blockchain.getWs(),
      contract.get().getAddress()
    )

    actionsListener.startCreatedAuthorizedActionListening(
      (action: AuthorizedAction) => {
        this.lastAuthorized = action
      }
    )

    actionsListener.startCreatedDeniedActionListening(
      (action: DeniedAction) => {
        this.lastDenied = action
      }
    )

    actionsListener.startCreatedPendingActionListening(
      (action: PendingAction) => {
        this.lastPending = action
      }
    )
  }

  public getLastPendingCreated(): undefined | PendingAction {
    return this.lastPending
  }

  public getLastAuthorizedCreated(): undefined | AuthorizedAction {
    return this.lastAuthorized
  }

  public getLastDeniedCreated(): undefined | DeniedAction {
    return this.lastDenied
  }

  public lastPendingActionId(): ActionId {
    if (this.lastPending === undefined) {
      assert.fail(
        'Expecting last pending action to be populated, but it is undefined'
      )
    }

    return this.lastPending.id
  }

  public lastDeniedActionId(): ActionId {
    if (this.lastDenied === undefined) {
      assert.fail(
        'Expecting last denied action to be populated, but it is undefined'
      )
    }

    return this.lastDenied.id
  }

  public lastAuthorizedActionId(): ActionId {
    if (this.lastAuthorized === undefined) {
      assert.fail(
        'Expecting last authorized action to be populated, but it is undefined'
      )
    }

    return this.lastAuthorized.id
  }

  public async create(contractCall: CreateFunction): Promise<PendingAction> {
    const previous = this.lastPending

    contractCall()

    while (this.lastPending === previous) {
      await sleep(150)
    }

    if (this.lastPending === undefined) {
      assert.fail('Failed to created a pending action')
    }
    const created: PendingAction = this.lastPending

    return created
  }

  public async authorize(
    contractCall: AuthorizeFunction
  ): Promise<AuthorizedAction> {
    const previous = this.lastAuthorized

    contractCall()

    while (this.lastAuthorized === previous) {
      await sleep(150)
    }

    if (this.lastAuthorized === undefined) {
      assert.fail('Failed to created a authorized action')
    }
    const created: AuthorizedAction = this.lastAuthorized

    return created
  }

  public async deny(contractCall: DenyFunction): Promise<DeniedAction> {
    const previous = this.lastDenied

    contractCall()

    while (this.lastDenied === previous) {
      await sleep(150)
    }

    if (this.lastDenied === undefined) {
      assert.fail('Failed to created a denied action')
    }
    const created: DeniedAction = this.lastDenied

    return created
  }
}
