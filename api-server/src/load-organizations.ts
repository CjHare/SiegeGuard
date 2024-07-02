import {
  DomainName,
  DomainNameSystem,
  EthereumAddress,
  FifthDimensionSecurityWeb3Http,
  Organization,
  Organizations,
  OrganizationId
} from '@just_another_developer/solidity'
import {Logger} from 'winston'

export function loadOrganizations(
  dns: DomainNameSystem,
  web3: FifthDimensionSecurityWeb3Http,
  funded: EthereumAddress,
  log: Logger
): Map<bigint, Organization> {
  const mapping = new Map<bigint, Organization>()

  const load = async () => {
    const orgs = await organizations(dns, web3, funded).catch(
      (error: Error) => {
        throw error
      }
    )
    const highestId = await orgs.lastOrganizationId().catch((error: Error) => {
      throw error
    })

    for (let i = 1n; i <= highestId.value; i++) {
      const id = OrganizationId.of(i)
      await organization(orgs, id, web3, funded)
        .then((org: Organization) => mapping.set(id.value, org))
        .catch((error: Error) => {
          throw error
        })
    }
  }

  load().catch((error: Error) => {
    log.error('Loading Organizations, %s', error)
    process.exit(9)
  })

  return mapping
}

async function organizations(
  dns: DomainNameSystem,
  web3: FifthDimensionSecurityWeb3Http,
  funded: EthereumAddress
): Promise<Organizations> {
  return dns
    .lookup(DomainName.of(Organizations.name))
    .then(
      (address: EthereumAddress) => new Organizations(web3, funded, address)
    )
}

async function organization(
  organization: Organizations,
  id: OrganizationId,
  web3: FifthDimensionSecurityWeb3Http,
  funded: EthereumAddress
): Promise<Organization> {
  const address = await organization.get(id).catch((error: Error) => {
    throw error
  })
  return new Organization(web3, funded, address)
}
