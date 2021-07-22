'use strict'

const {createLogger, transports, format} = require('winston')
const fs = require('fs')
const morgan = require('morgan')
const path = require('path')

let logLevel

let accessLog

const maximumLogFileSizeInBytes = 10 * 1024 * 1024

const environment = Object.is(process.env.NODE_ENV, undefined)
  ? 'unknown'
  : process.env.NODE_ENV.trim()

if (environment === 'production') {
  logLevel = 'info'
} else {
  logLevel = 'debug'
}

const log = createLogger({
  level: logLevel,
  format: format.combine(
    format.timestamp(),
    format.errors({stack: true}),
    format.splat(),
    format.json()
  ),
  defaultMeta: {service: 'Api Server'},
  transports: [
    new transports.File({
      filename: 'log/error.log',
      level: 'error',
      maxsize: maximumLogFileSizeInBytes
    }),
    new transports.File({
      filename: 'log/all.log',
      maxsize: maximumLogFileSizeInBytes
    })
  ]
})

const consoleFormat = format.printf(
  ({level, message, timestamp, ...metadata}) => {
    return `${timestamp} [${level}] : ${message} `
  }
)

if (environment === 'development') {
  log.add(
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.timestamp(),
        consoleFormat
      )
    })
  )
}

function consoleAccessLog() {
  log.stream = {
    write: function (message, encoding) {
      log.http(message)
    }
  }

  return morgan(
    ':date[iso] :remote-addr - ":method :url HTTP/:http-version" :status ":user-agent"',
    log.stream
  )
}

function accessLogFile() {
  const accessLogStream = fs.createWriteStream(path.join('log', 'access.log'), {
    flags: 'a'
  })
  return morgan('combined', {stream: accessLogStream})
}

if (environment === 'development') {
  accessLog = consoleAccessLog()
} else {
  accessLog = accessLogFile()
}

exports.log = log
exports.accessLog = accessLog
