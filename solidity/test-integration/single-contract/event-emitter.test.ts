import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'
import {EventEmitter} from '../../src/contract/event-emitter/event-emitter'
import {GanacheServer} from '../framework/ganache-server'
import {funded} from '../framework/integration-test-config'
import {IntegrationTestContract} from '../framework/integration-test-contract'

chai.use(chaiAsPromised)
chai.should()

const blockchain = new GanacheServer(funded)
const eventEmitter = new IntegrationTestContract<EventEmitter>(blockchain)

describe('EventEmitter contract', () => {
  describe('no blockchain connection', () => {
    it('errors on set value of 22', async () => {
      eventEmitter
        .blockchainStopped(EventEmitter)
        .set(22)
        .should.be.rejectedWith(
          'EventEmitter contract setting value of 33 failed: Invalid JSON RPC response: ""'
        )
    })
  })

  describe('not deployed', () => {
    it('errors on set value of 22', async () => {
      eventEmitter
        .notDeployed(EventEmitter)
        .set(22)
        .should.be.rejectedWith(
          'EventEmitter contract setting value of 33 failed: Invalid JSON RPC response: ""'
        )
    })
  })

  describe('deployed', () => {
    before(async () => {
      await eventEmitter.deploy(EventEmitter)
    })

    it('set value of 22', async () => {
      await eventEmitter.get().set(22)
    })
  })
})
