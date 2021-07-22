export class ValidationException extends Error {
  message: string

  constructor(message?: string) {
    super()
    this.message = message || ''
  }
}
