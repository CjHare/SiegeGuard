import {validateSync} from 'class-validator'
import {ValidationException} from '../../exception/validation-exception'
import {stringify} from '../../fifth-dimension-security/stringify'

/**
 * Validate according to the domain object's validation rule.
 *
 * @return the successfully validated object.
 * @ValidationException domain object failed validation.
 */
export function validate<T>(value: T): T {
  const errors = validateSync(value)

  if (errors.length > 0) {
    const message = stringify(value) + ', ' + errors.join(', ')
    throw new ValidationException(message)
  }

  return value
}
