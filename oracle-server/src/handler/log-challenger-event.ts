import {
  ActionId,
  ChallengeId,
  ChallengeTitle,
  ChallengeMessage,
  DeviceId,
  DeviceToken,
  OrganizationId,
  PolicyId
} from '@just_another_developer/solidity'
import {log} from '../container'

export function logChallengerEvent(
  authorizingOrganization: OrganizationId,
  authorizingPolicy: PolicyId,
  authorizingAction: ActionId,
  recipient: DeviceId,
  token: DeviceToken,
  id: ChallengeId,
  title: ChallengeTitle,
  message: ChallengeMessage
): void {
  log.info(
    'OrganizationId: %s, PolicyId: %s, ActionId: %s, DeviceId: %s, DeviceToken: %s, ChallengeId: %s, ChallengeTitle: %s, ChallengeMessage: %s',
    authorizingOrganization.value,
    authorizingPolicy.value,
    authorizingAction.value,
    recipient.value,
    token.value,
    id.value,
    title.value,
    message.value
  )
}
