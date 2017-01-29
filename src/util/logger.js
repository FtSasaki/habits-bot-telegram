const winston = require('winston')

const logger = new (winston.Logger)({
    transports: [
        new (winston.transports.Console)({
            level: process.env.LOG_LEVEL || 'info',
            handleExceptions: true,
            humanReadableUnhandledException: true,
        }),
    ],
})

logger.exitOnError = false

module.exports = logger
