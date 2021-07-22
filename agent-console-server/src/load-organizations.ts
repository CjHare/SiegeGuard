import {
  DomainName,
  DomainNameSystem,
  EthereumAddress,
  FifthDimensionSecurityWeb3Http,
  Organization,
  Organizations,
  OrganizationId
} from '@just_another_developer/solidity'

//TODO this should not exist - push feature into Solidity lib
export async function loadOrganizations(
  dns: DomainNameSystem,
  web3: FifthDimensionSecurityWeb3Http,
  funded: EthereumAddress
): Promise<Map<bigint, Organization>> {
  const mapping = new Map<bigint, Organization>()

  const orgs = await organizations(dns, web3, funded).catch((error: Error) => {
    throw error
  })
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
