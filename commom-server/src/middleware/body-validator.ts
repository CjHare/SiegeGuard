import {plainToClass} from 'class-transformer'
import {validate, ValidationError} from 'class-validator'
import {RequestHandler} from 'express'
import {HttpException} from '../exception/http-exception'

export function bodyValidator<T>(type: T): RequestHandler {
  return (req, res, next) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    validate(plainToClass(type as any, req.body), {
      forbidUnknownValues: true
    }).then((errors: ValidationError[]) => {
      if (errors.length > 0) {
        const message = constraintMessages(errors).join(', ')
        const errorBody = {error: message}
        next(new HttpException(400, JSON.stringify(errorBody)))
      } else {
        next()
      }
    })
  }
}

export function constraintMessages(errors: ValidationError[]): string[] {
  let constraints: string[] = []

  errors.forEach((error) => {
    constraints = constraints.concat(
      prefixedConstraintMessages(error.property, error.children)
    )

    if (error.constraints !== undefined) {
      constraints = constraints.concat(Object.values(error.constraints))
    }
  })

  return constraints
}

function prefixedConstraintMessages(
  prefix: string,
  errors: ValidationError[]
): string[] {
  let constraints: string[] = []

  errors.forEach((error) => {
    constraints = constraints.concat(
      prefixedConstraintMessages(`${prefix}.${error.property}`, error.children)
    )

    if (error.constraints !== undefined) {
      constraints = constraints.concat(
        Object.values(error.constraints).map((error) => `${prefix}.${error}`)
      )
    }
  })

  return constraints
}
