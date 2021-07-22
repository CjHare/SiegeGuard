import {
  AccessControl,
  Actions,
  Agents,
  AgentId,
  AgentName,
  AgentUsername,
  ChallengeMessage,
  ChallengeTitle,
  Challenger,
  Challenges,
  Devices,
  DeviceName,
  DomainNameSystem,
  DeviceToken,
  Organization,
  Organizations,
  Policy,
  Policies,
  EthereumAddress,
  SolidityContract
} from '@just_another_developer/solidity'
import {classToPlain} from 'class-transformer'
import {Request, Response} from 'express'
import {sender, web3} from '../container'
import {FifthDimensionSecurityDomainDeployResponse} from './response/fifth-dimension-security-domain-deploy-response'
import {deploy as deployContract} from '@just_another_developer/solidity'
import {log} from '../../config/logger'

export function deploy(request: Request, response: Response): void {
  const deploymentErrors: Error[] = []
  const logError = (error: Error): void => {
    log.error(error)
    deploymentErrors.push(error)
  }

  let accessControl: AccessControl
  let agents: Agents
  let actions: Actions
  let challenger: Challenger
  let challenges: Challenges
  let devices: Devices
  let dns: DomainNameSystem
  let organization: Organization
  let organizations: Organizations
  let policies: Policies

  //TODO the policy should get create later on, input from user
  let policy: Policy

  const deployContracts = async () => {
    //TODO these transaction could be done async with different sender accounts

    await deployContract(web3, sender, AccessControl)
      .then((contract: AccessControl) => {
        accessControl = contract
      })
      .catch(logError)

    if (accessControl !== undefined) {
      const accessControlAddress = accessControl.getAddress().value

      await deployContract(web3, sender, Agents, [accessControlAddress])
        .then((contract: Agents) => {
          agents = contract
        })
        .catch(logError)

      await deployContract(web3, sender, Challenger, [accessControlAddress])
        .then((contract: Challenger) => {
          challenger = contract
        })
        .catch(logError)

      await deployContract(web3, sender, Devices, [accessControlAddress])
        .then((contract: Devices) => {
          devices = contract
        })
        .catch(logError)

      await deployContract(web3, sender, Organizations, [accessControlAddress])
        .then((contract: Organizations) => {
          organizations = contract
        })
        .catch(logError)

      await deployContract(web3, sender, Policies, [accessControlAddress])
        .then((contract: Policies) => {
          policies = contract
        })
        .catch(logError)

      if (challenger !== undefined) {
        await deployContract(web3, sender, Challenges, [
          accessControlAddress,
          challenger.getAddress().value
        ])
          .then((contract: Challenges) => {
            challenges = contract
          })
          .catch(logError)
      } else {
        logError(
          new Error(
            'Unable to deploy Challenges contract, missing prerequisite'
          )
        )
      }

      //TODO needs the name of the Organization - inject (request object)
      //TODO the first challenges is the AgentChallengesView - will need updating later

      if (policies !== undefined && challenges !== undefined) {
        await deployContract(web3, sender, Organization, [
          accessControlAddress,
          challenges.getAddress().value,
          challenges.getAddress().value,
          policies.getAddress().value,
          'An IT Organization'
        ])
          .then((contract: Organization) => {
            organization = contract
          })
          .catch(logError)
      } else {
        logError(
          new Error(
            'Unable to deploy Organization contract, missing prerequisite'
          )
        )
      }

      if (challenges !== undefined) {
        await deployContract(web3, sender, Actions, [
          accessControlAddress,
          challenges.getAddress().value
        ])
          .then((contract: Actions) => {
            actions = contract
          })
          .catch(logError)
      } else {
        logError(
          new Error('Unable to deploy Actions contract, missing prerequisite')
        )
      }

      if (deploymentErrors.length == 0) {
        await adminPermissions(actions, accessControl).catch(logError)
        await adminPermissions(challenges, accessControl).catch(logError)
        await adminPermissions(organization, accessControl).catch(logError)
        await adminPermissions(organizations, accessControl).catch(logError)
        await adminPermissions(policies, accessControl).catch(logError)
      }

      if (
        deploymentErrors.length == 0 &&
        organization !== undefined &&
        organizations !== undefined
      ) {
        await organizations.add(organization.getAddress()).catch(logError)
      }

      //TODO Policy needs it's title - inject (requests object)
      if (
        deploymentErrors.length == 0 &&
        actions !== undefined &&
        devices !== undefined
      ) {
        await deployContract(web3, sender, Policy, [
          accessControlAddress,
          actions.getAddress().value,
          devices.getAddress().value,
          'Policy Title / Desription'
        ])
          .then((contract: Policy) => {
            policy = contract
          })
          .catch(logError)
      }

      if (
        deploymentErrors.length == 0 &&
        policy !== undefined &&
        organization !== undefined
      ) {
        await adminPermissions(policy, accessControl).catch(logError)

        const challengeTitle = ChallengeTitle.of(
          'Attention - request for authorization'
        )
        const challengeMessage = ChallengeMessage.of(
          'Details of the challenge request'
        )
        const approverIds = [1n, 2n, 3n]
        const approvalsRequired = 2
        const timeoutSeconds = 60n * 10n

        await policy
          .initChallenge(
            challengeTitle,
            challengeMessage,
            approverIds,
            approvalsRequired,
            timeoutSeconds
          )
          .catch(logError)

        await organization.addPolicy(policy.getAddress()).catch(logError)
      }

      if (deploymentErrors.length == 0) {
        await deployContract(web3, sender, DomainNameSystem, [
          accessControlAddress
        ])
          .then((contract: DomainNameSystem) => {
            dns = contract
          })
          .catch(logError)
      }
    }

    if (deploymentErrors.length == 0 && agents !== undefined) {
      await agents
        .create(AgentName.of('Agent alpha'), AgentUsername.of('001'))
        .catch(logError)
      await agents
        .create(AgentName.of('Agent beta'), AgentUsername.of('002'))
        .catch(logError)
      await agents
        .create(AgentName.of('Agent gamma'), AgentUsername.of('003'))
        .catch(logError)
    }

    if (deploymentErrors.length == 0 && devices !== undefined) {
      await devices
        .create(
          AgentId.of(1n),
          DeviceName.of('Device uno'),
          DeviceToken.of('aaaaaaaBBBBBBBcccccc')
        )
        .catch(logError)

      await devices
        .create(
          AgentId.of(2n),
          DeviceName.of('Device dos'),
          DeviceToken.of('eeeeeeeeBBBBBBBffffffff')
        )
        .catch(logError)

      await devices
        .create(
          AgentId.of(2n),
          DeviceName.of('Device tres'),
          DeviceToken.of('zzzzzzzzzBBBBBBBoooooooo')
        )
        .catch(logError)
    }

    if (deploymentErrors.length == 0) {
      await updateDns(dns, challenger, Challenger.name, deploymentErrors)
      await updateDns(dns, organizations, Organizations.name, deploymentErrors)
    }

    sendResponse(response, dns, deploymentErrors)
  }

  deployContracts()
}

async function adminPermissions(
  contract: undefined | SolidityContract,
  access: AccessControl
): Promise<void> {
  if (contract !== undefined) {
    return access.addAdmin(contract.getAddress())
  }
}

function sendResponse(
  response: Response,
  contract: SolidityContract,
  deploymentErrors: Error[]
) {
  if (deploymentErrors.length == 0) {
    successResponse(response, contract.getAddress())
  } else {
    failureResponse(response, deploymentErrors)
  }
}

function successResponse(response: Response, address: EthereumAddress) {
  response.status(201)
  response.send(
    classToPlain(new FifthDimensionSecurityDomainDeployResponse(address))
  )
}

function failureResponse(response: Response, errors: Error[]) {
  response.status(500)
  response.setHeader('Content-Type', 'application/json')
  response.cork()

  response.write(
    `{error: ${errors.length} "errors encountered during contract deployment\n`
  )

  errors.forEach((e) => {
    response.write('\n')
    response.write(e.message)
  })

  response.write('"}')

  response.end()

  response.uncork()
}

async function updateDns(
  dns: DomainNameSystem,
  contract: SolidityContract,
  name: string,
  deploymentErrors: Error[]
) {
  return await dns
    .update(contract.getDomain(), contract.getAddress())
    .catch((error: Error) => {
      const cannotPopulateDnsContract = `${name} address not found in DNS: ${error.message}`
      log.error(cannotPopulateDnsContract)
      deploymentErrors.push({
        name: `${name} is missing`,
        message: cannotPopulateDnsContract
      })
    })
}
