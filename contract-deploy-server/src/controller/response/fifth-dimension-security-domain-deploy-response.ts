import {EthereumAddress} from '@just_another_developer/solidity'

export class FifthDimensionSecurityDomainDeployResponse {
  public address: EthereumAddress

  constructor(address: EthereumAddress) {
    this.address = address
  }
}
