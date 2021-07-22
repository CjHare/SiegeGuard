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
import got, {Response} from 'got/dist/source'
import {log} from '../container'

const oneSignalApiKey = 'MjI0MzMyYmMtZjA1MS00ZDkzLWFjODYtZGQ5YjBmZWZmYmY1'
const oneSignalAppId = '217eb85c-43bf-417d-a198-25579b7f2e40'
const oneSignalUrl = 'https://onesignal.com/api/v1/notifications'
const challengeUrl = 'https://seigeguard.5ds.io/challenge.html'

//TODO  defunct implementation - not using OneSignal
export function issueWebPushChallenge(
  authorizingOrganization: OrganizationId,
  authorizingPolicy: PolicyId,
  authorizingAction: ActionId,
  recipient: DeviceId,
  token: DeviceToken,
  id: ChallengeId,
  title: ChallengeTitle,
  message: ChallengeMessage
): void {
  const issueChallenge = async () => {
    await got
      .post(oneSignalUrl, {
        headers: {
          contentType: 'application/json; charset=utf-8',
          authorization: `Basic ${oneSignalApiKey}`
        },
        json: {
          app_id: oneSignalAppId,
          headings: {en: title},
          contents: {en: message},
          url: `${challengeUrl}?id=${id.value}&actionId=${authorizingAction.value}&organizationId=${authorizingOrganization.value}&policyId=${authorizingPolicy.value}&deviceId=${recipient.value}`,
          include_external_user_ids: [token]
        }
      })
      .then((response: Response<string>) => {
        log.verbose('OneSignal notification created: %s', response.body)

        const json = JSON.parse(response.body)

        if (json.errors !== undefined) {
          log.error(
            'OneSignal notification creation error: %s',
            JSON.stringify(json.errors)
          )
        }
      })
      .catch((error: Error) => {
        log.error(error)
      })
  }

  issueChallenge()

  //TODO reply to front end || redirect front end to appropriate success/error page
}
