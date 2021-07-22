import {validate, ValidationError} from 'class-validator'
import {plainToClass} from 'class-transformer'
import {ClassType} from 'class-transformer/ClassTransformer'
import {constraintMessages} from '@just_another_developer/common-server'

export class JsonValidator<T> {
  private json: string
  private subject: ClassType<T>
  private invalid: string[]
  private missing: string[]
  private missingString: string[]

  constructor(subject: ClassType<T>, json: string) {
    this.json = json
    this.subject = subject
    this.invalid = []
    this.missing = []
    this.missingString = []
  }

  hasInvalidString(invalid: string): JsonValidator<T> {
    this.invalid.push(invalid)
    return this
  }

  hasMissingString(missing: string): JsonValidator<T> {
    this.missingString.push(missing)
    return this
  }

  hasMissing(missing: string): JsonValidator<T> {
    this.missing.push(missing)
    return this
  }

  isValid(done: Mocha.Done): void {
    validate(plainToClass(this.subject, JSON.parse(this.json))).then((errors) =>
      errors.should.have.lengthOf(0, `${errors}`)
    )

    done()
  }

  validationError(done: Mocha.Done): void {
    validate(plainToClass(this.subject, JSON.parse(this.json))).then(
      (errors: ValidationError[]) => {
        try {
          const expectedMessages = this.expectedMessages()
          const messages = constraintMessages(errors)
          messages.should.have.lengthOf(expectedMessages.length, `${errors}`)

          messages.forEach((message) => {
            const index = expectedMessages.indexOf(message)
            index.should.be.greaterThan(
              -1,
              `Did not find: ${message}, in [${expectedMessages}]`
            )

            // Consume messages as they are found
            expectedMessages.splice(index, 1)
          })

          expectedMessages.should.have.lengthOf(
            0,
            `These expected valiation error were not encountered: ${expectedMessages}`
          )

          done()
        } catch (exception) {
          done(exception)
        }
      }
    )
  }

  private expectedMessages(): string[] {
    const invalidStringMessages = this.invalid.map((key) => this.nonString(key))
    const missingStringMessages = this.missingString.map((key) =>
      this.nonString(key)
    )
    const notEmptygMessagesString = this.missingString.map((key) =>
      this.missingMessage(key)
    )
    const notEmptygMessages = this.missing.map((key) =>
      this.missingMessage(key)
    )

    return invalidStringMessages
      .concat(missingStringMessages)
      .concat(notEmptygMessagesString)
      .concat(notEmptygMessages)
  }

  private missingMessage(key: string): string {
    return `${key} should not be empty`
  }

  private nonString(key: string): string {
    return `${key} must be a string`
  }
}

export function verifyJson<T>(
  type: ClassType<T>,
  json: string
): JsonValidator<T> {
  return new JsonValidator(type, json)
}
