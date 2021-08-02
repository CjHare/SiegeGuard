import chai, {assert} from 'chai'
import chaiAsPromised from 'chai-as-promised'
import {GanacheServer} from '../framework/ganache-server'
import {funded} from '../framework/integration-test-config'
import {IntegrationTestContract} from '../framework/integration-test-contract'
import {AccessControl} from '../../src/contract/access-control/access-control'
import {Devices} from '../../src/contract/device/devices'
import {DevicesWaiter} from '../framework/waiter/devices-waiter'
import {AgentId} from '../../src/contract/domain/agent/agent-id'
import {DeviceId} from '../../src/contract/domain/device/device-id'
import {DeviceName} from '../../src/contract/domain/device/device-name'
import {DeviceToken} from '../../src/contract/domain/device/device-token'
import {ObsoleteDeviceReason} from '../../src/contract/domain/device/obsolete-device-reason'
import {expectDevice} from '../domain/device-expect'
import {stringify} from '../../src/fifth-dimension-security/stringify'
import {
  argumentNotFound,
  contractNotDeployed,
  connectionError,
  uninitializedArgument
} from '../framework/error-messages'

chai.use(chaiAsPromised)
chai.should()

const blockchain = new GanacheServer(funded)
const devices = new IntegrationTestContract<Devices>(blockchain)
const access = new IntegrationTestContract<AccessControl>(blockchain)
const devicesWaiter = new DevicesWaiter()

describe('Devices contract', () => {
  describe('no blockchain connection', () => {
    it('errors on get device with id 1', async () => {
      return devices
        .blockchainStopped(Devices)
        .get(firstDeviceId)
        .should.be.rejectedWith(connectionError())
    })
  })

  describe('not deployed', () => {
    it('errors on get device with id 1', async () => {
      return devices
        .notDeployed(Devices)
        .get(firstDeviceId)
        .should.be.rejectedWith(contractNotDeployed())
    })
  })

  describe('deployed', () => {
    before(async () => {
      await access.deploy(AccessControl)
      await devices.deploy(Devices, access.get().getAddress().value)

      devicesWaiter.startListening(blockchain, devices)
    })

    it('create device', async () => {
      const nextId = (await devices.get().lastDeviceId()) + BigInt(1)
      const nextDeviceId = DeviceId.of(BigInt(nextId))

      const created = await devicesWaiter.create(async () =>
        devices.get().create(agentId, name, tokenOne)
      )

      return expectDevice(created).equals(nextDeviceId, agentId, name, tokenOne)
    })

    it('create device increases lastDeviceId', async () => {
      const countBefore = await devices.get().lastDeviceId()

      await devicesWaiter.create(async () =>
        devices.get().create(agentId, name, tokenTwo)
      )

      const countAfter = await devices.get().lastDeviceId()

      return assert(
        countAfter > countBefore,
        'Expecting the count after to be larger then the count before'
      )
    })

    it('get created device by id', async () => {
      const created = await devicesWaiter.create(async () =>
        devices.get().create(agentId, name, tokenThree)
      )

      const retrieved = await devices.get().get(created.id)

      return retrieved.should.deep.equal(created)
    })

    it('errors on get uninitialized device id', async () => {
      return devices
        .get()
        .get(uninitializedDeviceId)
        .should.be.rejectedWith(deviceIdUninitialized(uninitializedDeviceId))
    })

    it('errors on get non-existent device id', async () => {
      const id = DeviceId.of(BigInt(100))

      return devices.get().get(id).should.be.rejectedWith(deviceNotFound(id))
    })

    it('obsolete a device', async () => {
      const created = await devicesWaiter.create(async () =>
        devices.get().create(agentId, name, tokenFour)
      )

      const obsolete = await devicesWaiter.obsolete(async () =>
        devices.get().obsolete(created.id, obsoleteReason)
      )

      obsolete.should.deep.equals(devicesWaiter.getLastObsoleteDevice())

      return devices
        .get()
        .get(created.id)
        .should.be.rejectedWith(deviceNotFound(created.id))
    })

    it('obsolete a non-existent device', async () => {
      const id = DeviceId.of(BigInt(100))

      return devices
        .get()
        .obsolete(id, obsoleteReason)
        .should.be.rejectedWith(obsoleteNonExistentDevice(id, obsoleteReason))
    })

    it('get obsolete device by id', async () => {
      const id = devicesWaiter.lastObsoleteDeviceId()

      const device = await devices.get().getObsolete(id)

      return device.should.deep.equal(devicesWaiter.getLastObsoleteDevice())
    })

    it('errors on get non-existent obsolete device by id', async () => {
      const id = DeviceId.of(BigInt(100))

      return devices
        .get()
        .getObsolete(id)
        .should.be.rejectedWith(obsoleteDeviceNotFound(id))
    })

    it('remove obsolete device', async () => {
      const id = devicesWaiter.lastObsoleteDeviceId()
      await assertObsoleteDeviceExists(id)

      await devices.get().removeObsolete(id)

      return devices
        .get()
        .getObsolete(id)
        .should.be.rejectedWith(obsoleteDeviceNotFound(id))
    })

    it('get agent devices', async () => {
      const agentDevices = await devices.get().agentDevices(agentId)

      agentDevices.length.should.equal(3)
      agentDevices[0].agentId.should.deep.equal(agentId)
      agentDevices[0].name.should.deep.equal(name)
      agentDevices[0].token.should.deep.equal(tokenOne)
      agentDevices[1].agentId.should.deep.equal(agentId)
      agentDevices[1].name.should.deep.equal(name)
      agentDevices[1].token.should.deep.equal(tokenTwo)
      agentDevices[2].agentId.should.deep.equal(agentId)
      agentDevices[2].name.should.deep.equal(name)
      return agentDevices[2].token.should.deep.equal(tokenThree)
    })

    it('errors on get uninitialized agent', async () => {
      return devices
        .get()
        .agentDevices(uninitializeAgentId)
        .should.be.rejectedWith(agentDevicesNotFound(uninitializeAgentId))
    })

    it('errors on get non-existent agent', async () => {
      const id = DeviceId.of(BigInt(100))

      const agentDevices = await devices.get().agentDevices(id)

      return agentDevices.length.should.equal(0)
    })

    it('destroy when populated', async () => {
      await assertDeviceCountGreaterThanZero()

      await devices.get().destroy()

      return devices
        .get()
        .lastDeviceId()
        .should.be.rejectedWith(contractNotDeployed())
    })

    async function assertObsoleteDeviceExists(id: DeviceId): Promise<void> {
      const last = await devices.get().getObsolete(id)

      return assert.isTrue(last.id.value > BigInt(0))
    }
  })

  const firstDeviceId = DeviceId.of(BigInt(1))
  const uninitializedDeviceId = DeviceId.of(BigInt(0))
  const uninitializeAgentId = AgentId.of(BigInt(0))
  const agentId = AgentId.of(BigInt(7))
  const name = DeviceName.of('Device Name')
  const tokenOne = DeviceToken.of('1caae592-0013-4958-a5f4-4e4441a3d45f')
  const tokenTwo = DeviceToken.of('1caae592-0013-4958-a5f4-4e3331a3d45f')
  const tokenThree = DeviceToken.of('1caae592-0013-4958-a5f4-4e2221a3d45f')
  const tokenFour = DeviceToken.of('1caae592-0013-4958-a5f4-4e1111a3d45f')
  const obsoleteReason = ObsoleteDeviceReason.of('Time to change up the device')
})

function deviceIdUninitialized(id: DeviceId): string {
  return uninitializedArgument(
    'Devices',
    devices.contract.getAddress(),
    'get',
    'deviceId',
    id.value
  )
}

function deviceNotFound(id: DeviceId): string {
  return argumentNotFound(
    'Devices',
    devices.contract.getAddress(),
    'get',
    id.value
  )
}

function obsoleteDeviceNotFound(id: DeviceId): string {
  return argumentNotFound(
    'Devices',
    devices.contract.getAddress(),
    'getObsolete',
    id.value
  )
}

function agentDevicesNotFound(id: DeviceId): string {
  return uninitializedArgument(
    'Devices',
    devices.contract.getAddress(),
    'agentDevices',
    'agentId',
    id.value
  )
}

function obsoleteNonExistentDevice(
  id: DeviceId,
  reason: ObsoleteDeviceReason
): string {
  return `Devices @ ${
    devices.contract.getAddress().value
  } obsolete ( ${stringify(id.value)}, ${stringify(
    reason.value
  )} ) failed. Error: Returned error: VM Exception while processing transaction: revert Uninitialized deviceId`
}

async function assertDeviceCountGreaterThanZero() {
  const count = await devices.get().lastDeviceId()
  assert(
    count > BigInt(0),
    'Expecting the Device count to be greater than zero'
  )
}
