import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'
import {GanacheServer} from '../framework/ganache-server'
import {funded, nonAddress} from '../framework/integration-test-config'
import {IntegrationTestContract} from '../framework/integration-test-contract'
import {AccessControl} from '../../src/contract/access-control/access-control'
import {EthereumAddress} from '../../src/web3/domain/ethereum-address'
import {contractNotDeployed, connectionError} from '../framework/error-messages'

chai.use(chaiAsPromised)
chai.should()

const blockchain = new GanacheServer(funded)
const access = new IntegrationTestContract<AccessControl>(blockchain)

describe('AccessControl contract', () => {
  describe('no blockchain connection', () => {
    it('errors on get owners', async () => {
      return access
        .blockchainStopped(AccessControl)
        .getOwners()
        .should.be.rejectedWith(connectionError())
    })
  })

  describe('not deployed', () => {
    it('errors on get owners', async () => {
      return access
        .notDeployed(AccessControl)
        .getOwners()
        .should.be.rejectedWith(contractNotDeployed())
    })
  })

  describe('deployed', () => {
    before(async () => {
      await access.deploy(AccessControl)
    })

    it('dummy addres as the first owner', async () => {
      const owners = await access.get().getOwners()
      owners.length.should.equal(2)
      return owners[0].should.deep.equal(nonAddress)
    })

    it('dummy addres as the first admin', async () => {
      const admins = await access.get().getAdmins()
      admins.length.should.equal(1)
      return admins[0].should.deep.equal(nonAddress)
    })

    it('dummy addres as the first user', async () => {
      const users = await access.get().getUsers()
      users.length.should.equal(1)
      return users[0].should.deep.equal(nonAddress)
    })

    it('creator as the second owner', async () => {
      expectOwnersLength(2)

      const owners = await access.get().getOwners()
      owners.length.should.equal(2)
      return owners[1].should.deep.equal(funded)
    })

    it('add an owner', async () => {
      expectOwnersLength(2)

      await access.get().addOwner(anotherOwner)

      const owners = await access.get().getOwners()
      owners.length.should.equal(3)
      return owners[2].should.deep.equal(anotherOwner)
    })

    it('cannot add the same owner again', async () => {
      expectOwnersLength(3)

      return access
        .get()
        .addOwner(funded)
        .should.be.rejectedWith(ownerAlreadyExists())
    })

    it('cannot add the same owner as an admin', async () => {
      return access
        .get()
        .addAdmin(funded)
        .should.be.rejectedWith(ownerAlreadyExists())
    })

    it('cannot add the same owner as a user', async () => {
      return access
        .get()
        .addUser(funded)
        .should.be.rejectedWith(ownerAlreadyExists())
    })

    it('add an admin', async () => {
      expectAdminsLength(1)

      await access.get().addAdmin(anotherAdmin)

      const admins = await access.get().getAdmins()
      admins.length.should.equal(2)
      return admins[1].should.deep.equal(anotherAdmin)
    })

    it('cannot add the same admin agin', async () => {
      expectAdminsLength(1)

      return access
        .get()
        .addAdmin(anotherAdmin)
        .should.be.rejectedWith(adminAlreadyExists())
    })

    it('cannot add the same admin as an owner', async () => {
      return access
        .get()
        .addOwner(anotherAdmin)
        .should.be.rejectedWith(adminAlreadyExists())
    })

    it('cannot add the same admin as a user', async () => {
      return access
        .get()
        .addUser(anotherAdmin)
        .should.be.rejectedWith(adminAlreadyExists())
    })

    it('add a user', async () => {
      expectUsersLength(1)

      await access.get().addUser(anotherUser)

      const users = await access.get().getUsers()
      users.length.should.equal(2)
      return users[1].should.deep.equal(anotherUser)
    })

    it('cannot add the same user again', async () => {
      expectUsersLength(1)

      return access
        .get()
        .addUser(anotherUser)
        .should.be.rejectedWith(userAlreadyExists())
    })

    it('cannot add the same user as an owner', async () => {
      return access
        .get()
        .addOwner(anotherUser)
        .should.be.rejectedWith(userAlreadyExists())
    })

    it('cannot add the same user as an admin', async () => {
      return access
        .get()
        .addAdmin(anotherUser)
        .should.be.rejectedWith(userAlreadyExists())
    })

    it('remove the added owner', async () => {
      expectOwnersLength(3)

      await access.get().removeOwner(anotherOwner)

      const owners = await access.get().getOwners()
      owners.length.should.equal(3)
      owners[0].should.deep.equal(nonAddress)
      owners[1].should.deep.equal(funded)
      return owners[2].should.deep.equal(nonAddress)
    })

    it('remove the added admin', async () => {
      expectAdminsLength(2)

      await access.get().removeAdmin(anotherAdmin)

      const admins = await access.get().getAdmins()
      admins.length.should.equal(2)
      admins[0].should.deep.equal(nonAddress)
      return admins[1].should.deep.equal(nonAddress)
    })

    it('remove the added user', async () => {
      expectUsersLength(2)

      await access.get().removeUser(anotherUser)

      const users = await access.get().getUsers()
      users.length.should.equal(2)
      users[0].should.deep.equal(nonAddress)
      return users[1].should.deep.equal(nonAddress)
    })
  })

  const anotherOwner = EthereumAddress.of(
    '0x0000000000000000000000000000000000000001'
  )
  const anotherAdmin = EthereumAddress.of(
    '0x0000000000000000000000000000000000000002'
  )
  const anotherUser = EthereumAddress.of(
    '0x0000000000000000000000000000000000000003'
  )
})

async function expectOwnersLength(size: number): Promise<void> {
  const owners = await access.get().getOwners()
  owners.length.should.equal(size)
}

async function expectAdminsLength(size: number): Promise<void> {
  const admins = await access.get().getAdmins()
  admins.length.should.equal(size)
}

async function expectUsersLength(size: number): Promise<void> {
  const users = await access.get().getUsers()
  users.length.should.equal(size)
}

function ownerAlreadyExists(): string {
  return 'Already present as an owner'
}

function adminAlreadyExists(): string {
  return 'Already present as an admin'
}

function userAlreadyExists(): string {
  return 'Already present as a user'
}
