import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'
import {GanacheServer} from '../framework/ganache-server'
import {funded} from '../framework/integration-test-config'
import {IntegrationTestContract} from '../framework/integration-test-contract'
import {AccessControl} from '../../src/contract/access-control/access-control'
import {DomainNameSystem} from '../../src/contract/domain-name-system/domain-name-system'
import {DomainName} from '../../src/contract/domain/domain-name-system/domain-name'
import {EthereumAddress} from '../../src/web3/domain/ethereum-address'
import {contractNotDeployed, connectionError} from '../framework/error-messages'

chai.use(chaiAsPromised)
chai.should()

const blockchain = new GanacheServer(funded)
const access = new IntegrationTestContract<AccessControl>(blockchain)
const dns = new IntegrationTestContract<DomainNameSystem>(blockchain)

describe('DomainNameSystem contract', () => {
  describe('no blockchain connection', () => {
    it('errors on lookup', async () => {
      return dns
        .blockchainStopped(DomainNameSystem)
        .lookup(name)
        .should.be.rejectedWith(connectionError())
    })
  })

  describe('not deployed', () => {
    it('errors on lookup', async () => {
      return dns
        .notDeployed(DomainNameSystem)
        .lookup(name)
        .should.be.rejectedWith(contractNotDeployed())
    })
  })

  describe('deployed', () => {
    before(async () => {
      await access.deploy(AccessControl)
      await dns.deploy(DomainNameSystem, access.get().getAddress().value)
    })

    it('errors on lookup of unknown domain name', async () => {
      return dns.get().lookup(name).should.be.rejectedWith(domainNameUnknown())
    })

    it('update domain name', async () => {
      await dns.get().update(name, address)

      const lookup = await dns.get().lookup(name)

      return lookup.should.deep.equal(address)
    })
  })

  const name = DomainName.of('a-totally-real-domain-name')
  const address = EthereumAddress.of(
    '0x0C297015c15F2521ed2Dc64e9AC482f810B7d393'
  )
})

export function domainNameUnknown(): string {
  return 'a-totally-real-domain-name domain address is unknown'
}
