# SiegeGuard
The SiegeGuard project was the MVP for a MultiParty Authentication (MPA) service by 5th Dimensional Security (5DS). 

Designed to provide a secure way of handling authentication involving multiple parties, 
SiegeGuard was aimed at applications where multiple entities need to authenticate actions or transactions collaboratively. 
An MPA can be particularly useful in scenarios requiring high security and verification, 
such as in financial services, legal agreements, or collaborative platforms.

Bourne from the paper [Blockchain Properties for Near-Planetary, Interplanetary, and Metaplanetary Space Domains](https://arc.aiaa.org/doi/10.2514/1.I010833)
published in the peer reviewed journal American Institute of Aeronautics and Astronautics.

## 5DS
An Australian registered privately held business [ABN 61 638 987 283](https://www.abn.business.gov.au/ABN/View?abn=61638987283)
- Registration date: 9/02/2020
- Deregistered date: 28/07/2021

Specialising on a real-time internal Authorisation Service to help organisations validate suspicious, irreversible, or otherwise high- stakes actions before network actors can successfully execute them.

### MBP Outcome
Despite letters of intent, we were unable to secure mutually agreeable terms with a suitable primary investor.


## Architecture

### Network
Although SiegeGuard was designed for any EVM compatible chain, the expected network was a private PoA chain between interested parties e.g. 5DS, Auditors, armed forces, large corps.
The motivation for a private network over the mainnet Ethereum or a side chain was partially a decision of it's time (before L2 really came to prominence),
but primarily due to the target customer bases.


### Technologies 

#### TypeScript 
Typed ECMAScript that is transpiled to Javascript, relying on the following dependencies:
- ExpressJS : NodeJS Web Server 
- cors :  providing a Connect/Express middleware that can be used to enable CORS 
- class-validator : decorator providing validation on deserialization 
- winston : logging 
- morgan : HTTP request logging 
- web3 : Ethereum JSON-RPC abstraction
- chai : Assertion library  
- mocha : Typescript flavour of the test framework 
- esm : Typescript (ECAMScript) Module loader 
- eslint : Typescript linter, enforcing code format and standard recommendations  
- nyc : Code coverage report generation 
- prettier : Opinionated code formatter

#### DevOps
GitLab CI/CI implemented in the various YAML files (`.gitlab-ci.yml`), that triggered build, test, coverage and publishing on pushes to `main` .

Client side (programmer's side, prior to creating the GitLab PR) used:
- husky : Git Pre-Commit hooks, user side enforcement of Git project standards  
- lint-staged : Runs linters against Git staged file


#### Solidity
Written with `0.8.3` version of the [Solidity programming language](https://docs.soliditylang.org/en/v0.8.3/) (most recent version at the time).

Besides the hand-rolled typed bindings, that were tested with unit and integration tests on locally deployed contract (on a private network),
the Solidity was checked locally using [Slither](https://github.com/crytic/slither)

Initially, I choose to use `solc` over leading frameworks like Hardhat or Truffle because of the low number of contracts involved. Additionally, based on prior experience,
I had grievances with Truffle's opinionated approach and lacked confidence in Hardhat beyond running a test node.


#### Docker
Initial AWS deployment was of Docker containers, with the intention being to migrate to Kubernetes for production scalability.


#### API Blueprint
API Blueprint provides a concise yet expressive language to define APIs, which was used to generate API documentation to share with investors during the later implementation and design conversation with their technical experts. 


### Servers
Services are interaction points for either the end user or system manager, while the shared libraries provide code reuse for those services.

#### Services
- `challenge-response-server`: Accepts and evaluates the Agent's reply to a challenge.
- `api-server`: RESTful server for managing that state of the Organization, Policies, Agents and Challenges.
- `agent-console-server`: Provides access to any pending challenge requests by Organization.
- `contract-deploy-server`: Deploys the EVM bytecode to a compatible chain.

#### Shared / Common Libraries
- `common-server`: shared exception, middleware, container and route setup.
- `solidity`: Solidity contracts, with their strictly typed bindings, error handling, listeners and Web3 connection code.
- `oracle-server`: WebSocket EVM chain listener for logging challenge events.
- `rest-server-template`: framework to copy and paste to begin a new HTTP server that includes EVM related connection configuration.
- `eslint-configuration`: EsLint configuration used by all folders with `server` in their title
- `nyc-configuration`: NYC configuration used by all folders with `server` in their title
- `preitter-configuration`: Prettier configuration used by all folders with `server` in their title
- `typescript-configuration`: TypeScript configuration used by all folders with `server` in their title

#### Deployment
![SiegeGuard service deployment](/siege-guard-deployment.png "Server deployment")



## Notes

### A single commit code drop
The single commit of SiegeGuard is due to the project being developed in GitLab (hence the GitLab CI/CI files) and after
wrapping up 5DS, I received permission to open source my efforts.


### @just_another_developer
A temporary NPM user handled used to publish the services as part of CI/CD toolchain, removed after project wrap up.

The source files imported from the `@just_another_developer` space are all contained locally.
