import {FifthDimensionSecurityWeb3WebSocket} from '../../web3/fifth-dimension-security-web3-ws'
import {EthereumAddress} from '../../web3/domain/ethereum-address'
import {log} from '../../container'
import {AgentId} from '../domain/agent/agent-id'
import {DeviceId} from '../domain/device/device-id'
import {DeviceName} from '../domain/device/device-name'
import {DeviceToken} from '../domain/device/device-token'
import {Timestamp} from '../domain/time/timestamp'
import {Devices} from './devices'
import {Device} from '../domain/device/device'
import {ObsoleteDevice} from '../domain/device/obsolete-device'
import {EmittedEvent} from '../../web3/domain/emitted-event'
import {SolidityContractListener} from '../../fifth-dimension-security/solidity-contract-listener'
import {stringify} from '../../fifth-dimension-security/stringify'

interface CreatedObsoleteDeviceEvent {
  device: {
    deviceId: string
    agentId: string
    deviceName: string
    token: string
    creationDate: string
    obsoleteDate: string
    obsoleteReason: string
  }
}

interface CreatedDeviceEvent {
  device: {
    deviceId: string
    agentId: string
    deviceName: string
    token: string
    creationDate: string
  }
}

export interface CreatedDeviceHandler {
  (device: Device): void
}

export interface CreatedObsoleteDeviceHandler {
  (device: ObsoleteDevice): void
}

export class DevicesListener extends SolidityContractListener {
  constructor(
    web3: FifthDimensionSecurityWeb3WebSocket,
    contract: EthereumAddress
  ) {
    super(web3, contract, Devices.name)
  }

  public startCreatedDeviceListening(handler: CreatedDeviceHandler): void {
    const subscribe = () => {
      return this.getContract().events.createdDevice()
    }

    const delegate = (emitted: EmittedEvent<CreatedDeviceEvent>) => {
      log.verbose('%s event emitted from: %s', emitted.event, emitted.address)

      log.debug('Event: %s', emitted)
      log.debug('Name: %s', emitted.event)
      log.debug('Variables: %s', emitted.returnValues)

      const deflated = emitted.returnValues.device

      const id = DeviceId.of(BigInt(deflated.deviceId))
      const agentId = AgentId.of(BigInt(deflated.agentId))
      const name = DeviceName.of(deflated.deviceName)
      const token = DeviceToken.of(deflated.token)
      const creationDate = Timestamp.of(BigInt(deflated.creationDate))

      const created = Device.of(id, agentId, name, token, creationDate)

      if (log.isDebugEnabled()) {
        log.debug('Device: %s', stringify(created))
      }

      handler(created)
    }

    const eventName = `${this.getName()}.createdDevice( Device )`

    this.startListening(eventName, subscribe, delegate)
  }

  public startCreatedObsoleteDeviceListening(
    handler: CreatedObsoleteDeviceHandler
  ): void {
    const subscribe = () => {
      return this.getContract().events.createdObsoleteDevice()
    }

    const delegate = (emitted: EmittedEvent<CreatedObsoleteDeviceEvent>) => {
      log.verbose('%s event emitted from: %s', emitted.event, emitted.address)

      log.debug('Event: %s', emitted)
      log.debug('Name: %s', emitted.event)
      log.debug('Variables: %s', emitted.returnValues)

      const deflated = emitted.returnValues.device

      const id = DeviceId.of(BigInt(deflated.deviceId))
      const agentId = AgentId.of(BigInt(deflated.agentId))
      const name = DeviceName.of(deflated.deviceName)
      const token = DeviceToken.of(deflated.token)
      const creationDate = Timestamp.of(BigInt(deflated.creationDate))
      const obsoleteReason = DeviceToken.of(deflated.obsoleteReason)
      const obsoleteDate = Timestamp.of(BigInt(deflated.obsoleteDate))

      const created = ObsoleteDevice.obsolete(
        Device.of(id, agentId, name, token, creationDate),
        obsoleteReason,
        obsoleteDate
      )

      if (log.isDebugEnabled()) {
        log.debug('Device: %s', stringify(created))
      }

      handler(created)
    }

    const eventName = `${this.getName()}.createdObsoleteDevice( ObsoleteDevice )`

    this.startListening(eventName, subscribe, delegate)
  }
}
