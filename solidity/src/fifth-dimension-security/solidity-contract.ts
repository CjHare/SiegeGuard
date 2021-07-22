import {AbiItem} from 'web3-utils'
import {Contract} from 'web3-eth-contract'
import {log} from '../container'
import {EthereumAddress} from '../web3/domain/ethereum-address'
import {applicationBinaryInterface} from './solidity-source'
import {FifthDimensionSecurityWeb3} from '../web3/fifth-dimension-security-web3'
import {DomainName} from '../contract/domain/domain-name-system/domain-name'
import {ResultHandler} from './domain/result-handler'
import {ContractInteractionException} from '../exception/contract-interaction-exception'
import {stringify} from './stringify'
import {maximumGasAmount} from '../container'

export abstract class SolidityContract {
  private abi: AbiItem
  private address: EthereumAddress
  private contract: Contract
  private domain: DomainName
  private name: string

  constructor(
    web3: FifthDimensionSecurityWeb3,
    address: EthereumAddress,
    name: string
  ) {
    this.address = address
    this.abi = applicationBinaryInterface(name)
    this.domain = DomainName.of(name)
    this.name = name

    log.verbose('%s contract: %s', name, address)
    this.contract = web3.contract(address, this.abi)
  }

  public getAddress(): EthereumAddress {
    return this.address
  }

  public getContract(): Contract {
    return this.contract
  }

  public getDomain(): DomainName {
    return this.domain
  }

  public getName(): string {
    return this.name
  }

  /**
   * Performs logging with the prefix of the contract name and address, with the given description and values.
   */
  protected logContract(
    description: string,
    ...values: Record<string, unknown>[]
  ): void {
    if (log.isVerboseEnabled()) {
      if (values.length == 0) {
        log.verbose('%s @ %s %s', this.name, this.address.value, description)
      } else if (values.length == 1) {
        log.verbose(
          '%s @ %s %s %s',
          this.name,
          this.address.value,
          description,
          stringify(values[0])
        )
      } else {
        log.verbose(
          '%s @ %s %s %s',
          this.name,
          this.address.value,
          description,
          stringify(values)
        )
      }
    }
  }

  protected async call<T>(
    method: string,
    sender: EthereumAddress,
    handler: ResultHandler<T>
  ): Promise<void> {
    log.debug('%s @ %s %s ()', this.name, this.address.value, method)

    return this.getContract()
      .methods[method]()
      .call({from: sender.value, gas: maximumGasAmount})
      .then(this.withLogging(method, handler))
      .catch((error: Error) => {
        throw new ContractInteractionException(
          `${this.name} @ ${
            this.address.value
          } ${method} () failed. ${error.toString()}`
        )
      })
  }

  protected async callOneArgument<T, U>(
    method: string,
    sender: EthereumAddress,
    arg: U,
    handler: ResultHandler<T>
  ): Promise<void> {
    if (log.isDebugEnabled()) {
      log.debug(
        '%s @ %s %s ( %s )',
        this.name,
        this.address.value,
        method,
        stringify(arg)
      )
    }

    return this.getContract()
      .methods[method](arg)
      .call({from: sender.value, gas: maximumGasAmount})
      .then(this.withOneArgumentLogging(method, arg, handler))
      .catch((error: Error) => {
        throw new ContractInteractionException(
          `${this.name} @ ${this.address.value} ${method} ( ${stringify(
            arg
          )} ) failed. ${error.toString()}`
        )
      })
  }
  protected async destroy(sender: EthereumAddress): Promise<void> {
    return await this.send(
      'destroy',
      sender,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      (_: Record<string, unknown>) => {
        log.verbose('%s @ %s has been destroyed', this.name, this.getAddress)
      }
    )
  }

  protected async send<T>(
    method: string,
    sender: EthereumAddress,
    handler: ResultHandler<T>
  ): Promise<void> {
    log.debug('%s @ %s %s ()', this.name, this.address.value, method)

    return this.getContract()
      .methods[method]()
      .send({from: sender.value, gas: maximumGasAmount})
      .then(this.withLogging(method, handler))
      .catch((error: Error) => {
        throw new ContractInteractionException(
          `${this.name} @ ${
            this.address.value
          } ${method} () failed. ${error.toString()}`
        )
      })
  }

  protected async sendOneArgument<T, U>(
    method: string,
    sender: EthereumAddress,
    arg: U,
    handler: ResultHandler<T>
  ): Promise<void> {
    if (log.isDebugEnabled()) {
      log.debug(
        '%s @ %s ( %s )',
        this.name,
        this.address.value,
        method,
        stringify(arg)
      )
    }

    return this.getContract()
      .methods[method](arg)
      .send({from: sender.value, gas: maximumGasAmount})
      .then(this.withOneArgumentLogging(method, arg, handler))
      .catch((error: Error) => {
        throw new ContractInteractionException(
          `${this.name} @ ${this.address.value} ${method} ( ${stringify(
            arg
          )} ) failed. ${error.toString()}`
        )
      })
  }

  protected async sendTwoArguments<T, U, V>(
    method: string,
    sender: EthereumAddress,
    firstArg: U,
    secondArg: V,
    handler: ResultHandler<T>
  ): Promise<void> {
    if (log.isDebugEnabled()) {
      log.debug(
        '%s @ %s %s ( %s, %s )',
        this.name,
        this.address.value,
        method,
        stringify(firstArg),
        stringify(secondArg)
      )
    }

    return this.getContract()
      .methods[method](firstArg, secondArg)
      .send({from: sender.value, gas: maximumGasAmount})
      .then(
        this.withTwoArgumentsLogging(
          method,
          stringify(firstArg),
          stringify(secondArg),
          handler
        )
      )
      .catch((error: Error) => {
        throw new ContractInteractionException(
          `${this.name} @ ${this.address.value} ${method} ( ${stringify(
            firstArg
          )}, ${stringify(secondArg)} ) failed. ${error.toString()}`
        )
      })
  }

  protected async sendThreeArguments<T, U, V, W>(
    method: string,
    sender: EthereumAddress,
    firstArg: U,
    secondArg: V,
    thirdArg: W,
    handler: ResultHandler<T>
  ): Promise<void> {
    if (log.isDebugEnabled()) {
      log.debug(
        '%s @s %s ( %s, %s, %s )',
        this.name,
        this.address.value,
        method,
        stringify(firstArg),
        stringify(secondArg),
        stringify(thirdArg)
      )
    }

    return this.getContract()
      .methods[method](firstArg, secondArg, thirdArg)
      .send({from: sender.value, gas: maximumGasAmount})
      .then(
        this.withThreeArgumentsLogging(
          method,
          firstArg,
          secondArg,
          thirdArg,
          handler
        )
      )
      .catch((error: Error) => {
        throw new ContractInteractionException(
          `${this.name} @ ${this.address.value} ${method} ( ${stringify(
            firstArg
          )}, ${stringify(secondArg)}, ${stringify(
            thirdArg
          )} ) failed. ${error.toString()}`
        )
      })
  }

  protected async sendFourArguments<T, U, V, W, X>(
    method: string,
    sender: EthereumAddress,
    firstArg: U,
    secondArg: V,
    thirdArg: W,
    forthArg: X,
    handler: ResultHandler<T>
  ): Promise<void> {
    if (log.isDebugEnabled()) {
      log.debug(
        '%s @ %s %s ( %s, %s, %s, %s )',
        this.name,
        this.address.value,
        method,
        stringify(firstArg),
        stringify(secondArg),
        stringify(thirdArg),
        stringify(forthArg)
      )
    }

    return this.getContract()
      .methods[method](firstArg, secondArg, thirdArg, forthArg)
      .send({from: sender.value, gas: maximumGasAmount})
      .then(
        this.withFourArgumentsLogging(
          method,
          firstArg,
          secondArg,
          thirdArg,
          forthArg,
          handler
        )
      )
      .catch((error: Error) => {
        throw new ContractInteractionException(
          `${this.name} @ ${this.address.value} ${method} ( ${stringify(
            firstArg
          )}, ${stringify(secondArg)}, ${stringify(thirdArg)}, ${stringify(
            forthArg
          )} ) failed. ${error.toString()}`
        )
      })
  }

  protected async sendFiveArguments<T, U, V, W, X, Y>(
    method: string,
    sender: EthereumAddress,
    firstArg: U,
    secondArg: V,
    thirdArg: W,
    forthArg: X,
    fifthArg: Y,
    handler: ResultHandler<T>
  ): Promise<void> {
    if (log.isDebugEnabled()) {
      log.debug(
        '%s @ %s %s ( %s, %s, %s, %s, %s, )',
        this.name,
        this.address.value,
        method,
        stringify(firstArg),
        stringify(secondArg),
        stringify(thirdArg),
        stringify(forthArg),
        stringify(fifthArg)
      )
    }

    return this.getContract()
      .methods[method](firstArg, secondArg, thirdArg, forthArg, fifthArg)
      .send({from: sender.value, gas: maximumGasAmount})
      .then(
        this.withFiveArgumentsLogging(
          method,
          firstArg,
          secondArg,
          thirdArg,
          forthArg,
          fifthArg,
          handler
        )
      )
      .catch((error: Error) => {
        throw new ContractInteractionException(
          `${this.name} @ ${this.address.value} ${method} ( ${stringify(
            firstArg
          )}, ${stringify(secondArg)}, ${stringify(thirdArg)}, ${stringify(
            forthArg
          )}, ${stringify(fifthArg)} ) failed. ${error.toString()}`
        )
      })
  }

  protected async sendSixArguments<T, U, V, W, X, Y, Z>(
    method: string,
    sender: EthereumAddress,
    firstArg: U,
    secondArg: V,
    thirdArg: W,
    forthArg: X,
    fifthArg: Y,
    sixthArg: Z,
    handler: ResultHandler<T>
  ): Promise<void> {
    if (log.isDebugEnabled()) {
      log.debug(
        '%s @ %s %s ( %s, %s, %s, %s, %s, %s )',
        this.name,
        this.address.value,
        method,
        stringify(firstArg),
        stringify(secondArg),
        stringify(thirdArg),
        stringify(forthArg),
        stringify(fifthArg),
        stringify(sixthArg)
      )
    }

    return this.getContract()
      .methods[method](
        firstArg,
        secondArg,
        thirdArg,
        forthArg,
        fifthArg,
        sixthArg
      )
      .send({from: sender.value, gas: maximumGasAmount})
      .then(
        this.withSixArgumentsLogging(
          method,
          firstArg,
          secondArg,
          thirdArg,
          forthArg,
          fifthArg,
          sixthArg,
          handler
        )
      )
      .catch((error: Error) => {
        throw new ContractInteractionException(
          `${this.name} @ ${this.address.value} ${method} ( ${stringify(
            firstArg
          )}, ${stringify(secondArg)}, ${stringify(thirdArg)}, ${stringify(
            forthArg
          )}, ${stringify(fifthArg)}, ${stringify(
            sixthArg
          )} ) failed. ${error.toString()}`
        )
      })
  }

  protected async sendSevenArguments<T, U, V, W, X, Y, Z, A>(
    method: string,
    sender: EthereumAddress,
    firstArg: U,
    secondArg: V,
    thirdArg: W,
    forthArg: X,
    fifthArg: Y,
    sixthArg: Z,
    seventhArg: A,
    handler: ResultHandler<T>
  ): Promise<void> {
    if (log.isDebugEnabled()) {
      log.debug(
        '%s @ %s %s ( %s, %s, %s, %s, %s, %s, %s )',
        this.name,
        this.address.value,
        method,
        stringify(firstArg),
        stringify(secondArg),
        stringify(thirdArg),
        stringify(forthArg),
        stringify(fifthArg),
        stringify(sixthArg),
        stringify(seventhArg)
      )
    }

    return this.getContract()
      .methods[method](
        firstArg,
        secondArg,
        thirdArg,
        forthArg,
        fifthArg,
        sixthArg,
        seventhArg
      )
      .send({from: sender.value, gas: maximumGasAmount})
      .then(
        this.withSevenArgumentsLogging(
          method,
          firstArg,
          secondArg,
          thirdArg,
          forthArg,
          fifthArg,
          sixthArg,
          seventhArg,
          handler
        )
      )
      .catch((error: Error) => {
        throw new ContractInteractionException(
          `${this.name} @ ${this.address.value} ${method} ( ${stringify(
            firstArg
          )}, ${stringify(secondArg)}, ${stringify(thirdArg)}, ${stringify(
            forthArg
          )}, ${stringify(fifthArg)}, ${stringify(sixthArg)}, ${stringify(
            seventhArg
          )} ) failed. ${error.toString()}`
        )
      })
  }

  protected async sendEightArguments<T, U, V, W, X, Y, Z, A, B>(
    method: string,
    sender: EthereumAddress,
    firstArg: U,
    secondArg: V,
    thirdArg: W,
    forthArg: X,
    fifthArg: Y,
    sixthArg: Z,
    seventhArg: A,
    eighthArg: B,
    handler: ResultHandler<T>
  ): Promise<void> {
    if (log.isDebugEnabled()) {
      log.debug(
        '%s @ %s %s ( %s, %s, %s, %s, %s, %s, %s, %s )',
        this.name,
        this.address.value,
        method,
        stringify(firstArg),
        stringify(secondArg),
        stringify(thirdArg),
        stringify(forthArg),
        stringify(fifthArg),
        stringify(sixthArg),
        stringify(seventhArg),
        stringify(eighthArg)
      )
    }

    return this.getContract()
      .methods[method](
        firstArg,
        secondArg,
        thirdArg,
        forthArg,
        fifthArg,
        sixthArg,
        seventhArg,
        eighthArg
      )
      .send({from: sender.value, gas: maximumGasAmount})
      .then(
        this.withEightArgumentsLogging(
          method,
          firstArg,
          secondArg,
          thirdArg,
          forthArg,
          fifthArg,
          sixthArg,
          seventhArg,
          eighthArg,
          handler
        )
      )
      .catch((error: Error) => {
        throw new ContractInteractionException(
          `${this.name} @ ${this.address.value} ${method} ( ${stringify(
            firstArg
          )}, ${stringify(secondArg)}, ${stringify(thirdArg)}, ${stringify(
            forthArg
          )}, ${stringify(fifthArg)}, ${stringify(sixthArg)}, ${stringify(
            seventhArg
          )}, ${stringify(eighthArg)} ) failed. ${error.toString()}`
        )
      })
  }

  private withLogging<T>(
    method: string,
    handler: ResultHandler<T>
  ): ResultHandler<T> {
    return (receipt: T) => {
      if (log.isDebugEnabled()) {
        log.debug(
          '%s @ %s %s () handler',
          this.name,
          this.address.value,
          method
        )

        log.debug(
          '%s @ %s %s () receipt: %s',
          this.name,
          this.address.value,
          method,
          stringify(receipt)
        )
      }

      handler(receipt)
    }
  }

  private withOneArgumentLogging<T, U>(
    method: string,
    arg: U,
    handler: ResultHandler<T>
  ): ResultHandler<T> {
    return (receipt: T) => {
      if (log.isDebugEnabled()) {
        log.debug(
          '%s @ %a %s ( %s ) handler',
          this.name,
          this.address.value,
          method,
          stringify(arg)
        )

        log.debug(
          '%s @ %a %s ( %s ) receipt: %s',
          this.name,
          this.address.value,
          method,
          stringify(arg),
          stringify(receipt)
        )
      }

      handler(receipt)
    }
  }

  private withTwoArgumentsLogging<T, U, V>(
    method: string,
    firstArg: U,
    secondArg: V,
    handler: ResultHandler<T>
  ): ResultHandler<T> {
    return (receipt: T) => {
      if (log.isDebugEnabled()) {
        log.debug(
          '%s @ %s %s ( %s, %s ) handler',
          this.name,
          this.address.value,
          method,
          stringify(firstArg),
          stringify(secondArg)
        )

        log.debug(
          '%s @ %s %s ( %s, %s ) receipt: %s',
          this.name,
          this.address.value,
          method,
          stringify(firstArg),
          stringify(secondArg),
          stringify(receipt)
        )
      }

      handler(receipt)
    }
  }

  private withThreeArgumentsLogging<T, U, V, W>(
    method: string,
    firstArg: U,
    secondArg: V,
    thirdArg: W,
    handler: ResultHandler<T>
  ): ResultHandler<T> {
    return (receipt: T) => {
      if (log.isDebugEnabled()) {
        log.debug(
          '%s @ %s %s ( %s, %s, %s ) handler',
          this.name,
          this.address.value,
          method,
          stringify(firstArg),
          stringify(secondArg),
          stringify(thirdArg)
        )

        log.debug(
          '%s @ %s %s ( %s, %s, %s ) receipt: %s',
          this.name,
          this.address.value,
          method,
          stringify(firstArg),
          stringify(secondArg),
          stringify(thirdArg),
          stringify(receipt)
        )
      }

      handler(receipt)
    }
  }

  private withFourArgumentsLogging<T, U, V, W, X>(
    method: string,
    firstArg: U,
    secondArg: V,
    thirdArg: W,
    forthArg: X,
    handler: ResultHandler<T>
  ): ResultHandler<T> {
    return (receipt: T) => {
      if (log.isDebugEnabled()) {
        log.debug(
          '%s @ %s %s ( %s, %s, %s, %s ) handler',
          this.name,
          this.address.value,
          method,
          stringify(firstArg),
          stringify(secondArg),
          stringify(thirdArg),
          stringify(forthArg)
        )

        log.debug(
          '%s @ %s %s ( %s, %s, %s, %s ) receipt: %s',
          this.name,
          this.address.value,
          method,
          stringify(firstArg),
          stringify(secondArg),
          stringify(thirdArg),
          stringify(forthArg),
          stringify(receipt)
        )
      }

      handler(receipt)
    }
  }

  private withFiveArgumentsLogging<T, U, V, W, X, Y>(
    method: string,
    firstArg: U,
    secondArg: V,
    thirdArg: W,
    forthArg: X,
    fifthArg: Y,
    handler: ResultHandler<T>
  ): ResultHandler<T> {
    return (receipt: T) => {
      if (log.isDebugEnabled()) {
        log.debug(
          '%s @ %s %s ( %s, %s, %s, %s, %s ) handler',
          this.name,
          this.address.value,
          method,
          stringify(firstArg),
          stringify(secondArg),
          stringify(thirdArg),
          stringify(forthArg),
          stringify(fifthArg)
        )

        log.debug(
          '%s @ %s %s ( %s, %s, %s, %s, %s ) receipt: %s',
          this.name,
          this.address.value,
          method,
          stringify(firstArg),
          stringify(secondArg),
          stringify(thirdArg),
          stringify(forthArg),
          stringify(fifthArg),
          stringify(receipt)
        )
      }

      handler(receipt)
    }
  }

  private withSixArgumentsLogging<T, U, V, W, X, Y, Z>(
    method: string,
    firstArg: U,
    secondArg: V,
    thirdArg: W,
    forthArg: X,
    fifthArg: Y,
    sixthArg: Z,
    handler: ResultHandler<T>
  ): ResultHandler<T> {
    return (receipt: T) => {
      if (log.isDebugEnabled()) {
        log.debug(
          '%s @ %s %s ( %s, %s, %s, %s, %s, %s ) handler',
          this.name,
          this.address.value,
          method,
          stringify(firstArg),
          stringify(secondArg),
          stringify(thirdArg),
          stringify(forthArg),
          stringify(fifthArg),
          stringify(sixthArg)
        )

        log.debug(
          '%s @ %s %s ( %s, %s, %s, %s, %s, %s ) receipt: %s',
          this.name,
          this.address.value,
          method,
          stringify(firstArg),
          stringify(secondArg),
          stringify(thirdArg),
          stringify(forthArg),
          stringify(fifthArg),
          stringify(sixthArg),
          stringify(receipt)
        )
      }

      handler(receipt)
    }
  }

  private withSevenArgumentsLogging<T, U, V, W, X, Y, Z, A>(
    method: string,
    firstArg: U,
    secondArg: V,
    thirdArg: W,
    forthArg: X,
    fifthArg: Y,
    sixthArg: Z,
    seventhArg: A,
    handler: ResultHandler<T>
  ): ResultHandler<T> {
    return (receipt: T) => {
      if (log.isDebugEnabled()) {
        log.debug(
          '%s @ %s %s ( %s, %s, %s, %s, %s, %s, %s ) handler',
          this.name,
          this.address.value,
          method,
          stringify(firstArg),
          stringify(secondArg),
          stringify(thirdArg),
          stringify(forthArg),
          stringify(fifthArg),
          stringify(sixthArg),
          stringify(seventhArg)
        )

        log.debug(
          '%s @ %s %s ( %s, %s, %s, %s, %s, %s, %s ) receipt: %s',
          this.name,
          this.address.value,
          method,
          stringify(firstArg),
          stringify(secondArg),
          stringify(thirdArg),
          stringify(forthArg),
          stringify(fifthArg),
          stringify(sixthArg),
          stringify(seventhArg),
          stringify(receipt)
        )
      }

      handler(receipt)
    }
  }

  private withEightArgumentsLogging<T, U, V, W, X, Y, Z, A, B>(
    method: string,
    firstArg: U,
    secondArg: V,
    thirdArg: W,
    forthArg: X,
    fifthArg: Y,
    sixthArg: Z,
    seventhArg: A,
    eighthArg: B,
    handler: ResultHandler<T>
  ): ResultHandler<T> {
    return (receipt: T) => {
      if (log.isDebugEnabled()) {
        log.debug(
          '%s @ %s %s ( %s, %s, %s, %s, %s, %s, %s, %s ) handler',
          this.name,
          this.address.value,
          method,
          stringify(firstArg),
          stringify(secondArg),
          stringify(thirdArg),
          stringify(forthArg),
          stringify(fifthArg),
          stringify(sixthArg),
          stringify(seventhArg),
          stringify(eighthArg)
        )

        log.debug(
          '%s @ %s %s ( %s, %s, %s, %s, %s, %s, %s, %s ) receipt: %s',
          this.name,
          this.address.value,
          method,
          stringify(firstArg),
          stringify(secondArg),
          stringify(thirdArg),
          stringify(forthArg),
          stringify(fifthArg),
          stringify(sixthArg),
          stringify(seventhArg),
          stringify(eighthArg),
          stringify(receipt)
        )
      }

      handler(receipt)
    }
  }
}
