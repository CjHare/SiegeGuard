import {assert} from 'chai'
import {Device} from '../../../src/contract/domain/device/device'
import {Devices} from '../../../src/contract/device/devices'
import {DeviceId} from '../../../src/contract/domain/device/device-id'
import {DevicesListener} from '../../../src/contract/device/devices-listener'
import {IntegrationTestContract} from '../integration-test-contract'
import {GanacheServer} from '../ganache-server'
import {ObsoleteDevice} from '../../../src/contract/domain/device/obsolete-device'
import {sleep} from '../sleep'

export interface CreateFunction {
  (): Promise<void>
}

export interface ObsoleteFunction {
  (): Promise<void>
}

export class DevicesWaiter {
  private lastDeviceCreated: Device | undefined
  private lastObsoleteDevice: ObsoleteDevice | undefined

  public startListening(
    blockchain: GanacheServer,
    contract: IntegrationTestContract<Devices>
  ): void {
    const devicesListener = new DevicesListener(
      blockchain.getWs(),
      contract.get().getAddress()
    )

    this.lastDeviceCreated = undefined
    this.lastObsoleteDevice = undefined

    devicesListener.startCreatedDeviceListening((created: Device) => {
      this.lastDeviceCreated = created
    })

    devicesListener.startCreatedObsoleteDeviceListening(
      (obsolete: ObsoleteDevice) => {
        this.lastObsoleteDevice = obsolete
      }
    )
  }

  public getLastObsoleteDevice(): ObsoleteDevice | undefined {
    return this.lastObsoleteDevice
  }

  public lastObsoleteDeviceId(): DeviceId {
    if (this.lastObsoleteDevice !== undefined) {
      return this.lastObsoleteDevice.id
    }
    assert.fail('No Obsolete Device yet')
  }

  public async obsolete(
    contractCall: ObsoleteFunction
  ): Promise<ObsoleteDevice> {
    const previouslyObsolete = this.lastObsoleteDevice

    await contractCall()

    while (this.lastObsoleteDevice === previouslyObsolete) {
      await sleep(150)
    }

    if (this.lastObsoleteDevice === undefined) {
      assert.fail('Failed to obsolete the device')
    }
    const obsolete: ObsoleteDevice = this.lastObsoleteDevice

    return obsolete
  }

  public async create(contractCall: CreateFunction): Promise<Device> {
    const previouslyCreate = this.lastDeviceCreated

    await contractCall()

    while (this.lastDeviceCreated === previouslyCreate) {
      await sleep(150)
    }

    if (this.lastDeviceCreated === undefined) {
      assert.fail('Failed to created a device')
    }
    const created: Device = this.lastDeviceCreated

    return created
  }
}
