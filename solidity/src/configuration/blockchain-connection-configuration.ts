export interface HttpConnectionConfiguration {
  host: string
  port: number

  uri(): string
}

export interface WebSocketConnectionConfiguration {
  host: string
  port: number

  uri(): string
}
