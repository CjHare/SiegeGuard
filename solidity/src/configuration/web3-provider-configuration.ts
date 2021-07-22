export const httpOptions = {
  keepAlive: true,
  withCredentials: false,
  timeout: 2500, // ms
  headers: [
    {
      name: 'Access-Control-Allow-Origin',
      value: '*'
    }
  ]
}

export const wsOptions = {
  timeout: 20000, // ms

  clientConfig: {
    keepalive: true,
    keepaliveInterval: 1000 // ms
  },

  reconnect: {
    auto: true,
    delay: 7500, // ms
    maxAttempts: 200,
    onTimeout: true
  }
}
