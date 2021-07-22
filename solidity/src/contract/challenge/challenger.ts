import {ActionId} from '../domain/action/action-id'
import {ChallengeId} from '../domain/challenge/challenge-id'
import {ChallengeTitle} from '../domain/challenge/challenge-title'
import {ChallengeMessage} from '../domain/challenge/challenge-message'
import {DeviceId} from '../domain/device/device-id'
import {DeviceToken} from '../domain/device/device-token'
import {EthereumAddress} from '../../web3/domain/ethereum-address'
import {OrganizationId} from '../domain/organization/organization-id'
import {PolicyId} from '../domain/policy/policy-id'
import {FifthDimensionSecurityWeb3} from '../../web3/fifth-dimension-security-web3'
import {SolidityContract} from '../../fifth-dimension-security/solidity-contract'

export class Challenger extends SolidityContract {
  private sender: EthereumAddress

  constructor(
    web3: FifthDimensionSecurityWeb3,
    funded: EthereumAddress,
    contract: EthereumAddress
  ) {
    super(web3, contract, Challenger.name)
    this.sender = funded
  }

  public async issue(
    organization: OrganizationId,
    policy: PolicyId,
    authorizing: ActionId,
    receipient: DeviceId,
    token: DeviceToken,
    id: ChallengeId,
    title: ChallengeTitle,
    message: ChallengeMessage
  ): Promise<void> {
    return this.sendEightArguments(
      'issue',
      this.sender,
      organization.value,
      policy.value,
      authorizing.value,
      receipient.value,
      token.value,
      id.value,
      title.value,
      message.value,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      (_: Record<string, unknown>) => {
        this.logContract('issued Challenge', {
          organizationId: organization.value,
          policyId: policy.value,
          actionId: authorizing.value,
          deviceId: receipient.value,
          deviceToken: token.value,
          challengeId: id.value,
          challengeTitle: title.value,
          challengeMessage: message.value
        })
      }
    )
  }

  public async destroy(): Promise<void> {
    return super.destroy(this.sender)
  }
}
