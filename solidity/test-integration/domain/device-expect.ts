import {assert} from 'chai'
import {expectEquals} from './expect-equals'
import {AgentId} from '../../src/contract/domain/agent/agent-id'
import {Device} from '../../src/contract/domain/device/device'
import {DeviceId} from '../../src/contract/domain/device/device-id'
import {DeviceName} from '../../src/contract/domain/device/device-name'
import {DeviceToken} from '../../src/contract/domain/device/device-token'

export interface DeviceComparator {
  /**
   * Deep equals evaluation of the agent against the given parameteres.
   */
  equals(
    id: DeviceId,
    agentIdd: AgentId,
    name: DeviceName,
    token: DeviceToken
  ): void
}

export function expectDevice(evaluating: Device): DeviceComparator {
  if (evaluating === undefined) {
    assert.fail('Device is undefined')
  }

  return {
    equals(
      id: DeviceId,
      agentId: AgentId,
      name: DeviceName,
      token: DeviceToken
    ): void {
      expectDeviceEquals(evaluating, id, agentId, name, token)
    }
  }
}

function expectDeviceEquals(
  evaluating: Device,
  id: DeviceId,
  agentId: AgentId,
  name: DeviceName,
  token: DeviceToken
) {
  expectEquals(evaluating.id, id)
  expectEquals(evaluating.agentId, agentId)
  expectEquals(evaluating.name, name)
  expectEquals(evaluating.token, token)
}
