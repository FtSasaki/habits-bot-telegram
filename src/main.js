const logger = require('./util/logger')
const Bot = require('./bot')

const config = require('./config')
logger.info('Starting with config', JSON.stringify(config, null, 2))

const bot = new Bot(config)
bot.listen()
    .then(() => {
        logger.info('Started listening to messages...')
    })
