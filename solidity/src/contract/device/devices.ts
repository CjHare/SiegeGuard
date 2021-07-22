import {Device} from '../domain/device/device'
import {DeviceId} from '../domain/device/device-id'
import {DeviceName} from '../domain/device/device-name'
import {DeviceToken} from '../domain/device/device-token'
import {ObsoleteDevice} from '../domain/device/obsolete-device'
import {ObsoleteDeviceReason} from '../domain/device/obsolete-device-reason'
import {AgentId} from '../domain/agent/agent-id'
import {Timestamp} from '../domain/time/timestamp'
import {EthereumAddress} from '../../web3/domain/ethereum-address'
import {FifthDimensionSecurityWeb3} from '../../web3/fifth-dimension-security-web3'
import {SolidityContract} from '../../fifth-dimension-security/solidity-contract'
import {ContractInteractionException} from '../../exception/contract-interaction-exception'
import {stringify} from '../../fifth-dimension-security/stringify'

interface BlockchainDevice {
  deviceId: string
  agentId: string
  deviceName: string
  token: string
  creationDate: string
}

interface BlockchainObsoleteDevice {
  deviceId: string
  agentId: string
  deviceName: string
  token: string
  creationDate: string
  obsoleteReason: string
  obsoleteDate: string
}

export class Devices extends SolidityContract {
  private sender: EthereumAddress

  constructor(
    web3: FifthDimensionSecurityWeb3,
    funded: EthereumAddress,
    contract: EthereumAddress
  ) {
    super(web3, contract, Devices.name)
    this.sender = funded
  }

  public async create(
    id: AgentId,
    name: DeviceName,
    token: DeviceToken
  ): Promise<void> {
    return this.sendThreeArguments(
      'create',
      this.sender,
      id.value,
      name.value,
      token.value,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      (_: Record<string, unknown>) => {
        this.logContract('created Device', {
          id: id.value,
          name: name.value,
          token: token.value
        })
      }
    )
  }

  public async lastDeviceId(): Promise<bigint> {
    let deviceCount: bigint | undefined

    await this.call('lastDeviceId', this.sender, (receipt: string) => {
      deviceCount = BigInt(receipt)
    }).catch((error: Error) => {
      throw error
    })

    if (deviceCount === undefined) {
      throw new ContractInteractionException(
        `${Devices.name} deviceCount () failed to retrun a value.`
      )
    }

    return deviceCount
  }

  public async agentDevices(id: AgentId): Promise<Device[]> {
    let devices: Device[] | undefined

    await this.callOneArgument(
      'agentDevices',
      this.sender,
      id.value,
      (receipt: BlockchainDevice[]) => {
        devices = []

        for (let i = 0; i < receipt.length; i++) {
          if (BigInt(receipt[i].deviceId) > 0) {
            const inflated = this.inflateDevice(receipt[i])
            devices.push(inflated)
          }
        }
      }
    ).catch((error: Error) => {
      throw error
    })

    if (devices === undefined) {
      throw new ContractInteractionException(
        `${Devices.name} getAgentDevices () failed to retrun a value.`
      )
    }

    return devices
  }

  public async get(id: DeviceId): Promise<Device> {
    let device: Device | undefined

    await this.callOneArgument(
      'get',
      this.sender,
      id.value,
      (receipt: BlockchainDevice) => {
        if (receipt.deviceId == '0') {
          throw new ContractInteractionException(
            `${Devices.name} get ( ${id.value} ) failed to retrun a value.`
          )
        }

        device = this.inflateDevice(receipt)
      }
    ).catch((error: Error) => {
      throw error
    })

    if (device === undefined) {
      throw new ContractInteractionException(
        `${stringify(id)} has no mapped Device.`
      )
    }

    return device
  }

  public async getObsolete(id: DeviceId): Promise<ObsoleteDevice> {
    let device: ObsoleteDevice | undefined

    await this.callOneArgument(
      'getObsolete',
      this.sender,
      id.value,
      (receipt: BlockchainObsoleteDevice) => {
        if (receipt.deviceId == '0') {
          throw new ContractInteractionException(
            `${Devices.name} getObsolete ( ${id.value} ) failed to retrun a value.`
          )
        }

        const deviceId = DeviceId.of(BigInt(receipt.deviceId))
        const agentId = AgentId.of(BigInt(receipt.agentId))
        const name = DeviceName.of(receipt.deviceName)
        const token = DeviceToken.of(receipt.token)
        const creationDate = Timestamp.of(BigInt(receipt.creationDate))
        const obsoleteReason = ObsoleteDeviceReason.of(receipt.obsoleteReason)
        const obsoleteDate = Timestamp.of(BigInt(receipt.obsoleteDate))

        device = ObsoleteDevice.obsolete(
          Device.of(deviceId, agentId, name, token, creationDate),
          obsoleteReason,
          obsoleteDate
        )
      }
    ).catch((error: Error) => {
      throw error
    })

    if (device === undefined) {
      throw new ContractInteractionException(
        `${stringify(id)} has no mapped ObsoleteDevice.`
      )
    }

    return device
  }

  public async obsolete(
    id: DeviceId,
    reason: ObsoleteDeviceReason
  ): Promise<void> {
    return this.sendTwoArguments(
      'obsolete',
      this.sender,
      id.value,
      reason.value,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      (_: Record<string, unknown>) => {
        this.logContract('obsoleted Device', {
          id: id.value,
          reason: reason.value
        })
      }
    )
  }

  public async removeObsolete(id: DeviceId): Promise<void> {
    return this.sendOneArgument(
      'removeObsolete',
      this.sender,
      id.value,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      (_: Record<string, unknown>) => {
        this.logContract('removed obsolete Device', {id: id.value})
      }
    )
  }

  public async destroy(): Promise<void> {
    return super.destroy(this.sender)
  }

  private inflateDevice(flat: BlockchainDevice): Device {
    const deviceId = DeviceId.of(BigInt(flat.deviceId))
    const agentId = AgentId.of(BigInt(flat.agentId))
    const name = DeviceName.of(flat.deviceName)
    const token = DeviceToken.of(flat.token)
    const creationDate = Timestamp.of(BigInt(flat.creationDate))

    return Device.of(deviceId, agentId, name, token, creationDate)
  }
}
