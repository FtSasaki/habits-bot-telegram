const _ = require('lodash')
const TelegramApi = require('telegram-bot-api')

const Store = require('../store')
const logger = require('../util/logger')
const conversations = require('../conversations')

class Bot {
    constructor(config) {
        this.handleError = this.handleError.bind(this)
        this.onMessage = this.onMessage.bind(this)

        this.store = new Store(config.store)

        const telegramConfig = _.merge(
            { updates: { enabled: true } },
            config.telegram
        )
        this.telegramApi = new TelegramApi(telegramConfig)
    }

    listen() {
        this.telegramApi.on('message', this.onMessage)
        return Promise.resolve()
    }

    onMessage(telegramMessage) {
        logger.debug('Bot.onMessage: ', JSON.stringify(telegramMessage, null, 2))

        const chatId = telegramMessage.chat.id
        const message = {
            text: telegramMessage.text || '',
        }

        const userId = telegramMessage.from.id
        const userData = {
            firstName: telegramMessage.from.first_name,
            lastName: telegramMessage.from.last_name,
            username: telegramMessage.from.username,
        }
        this.store.userUpsert(userId, userData)
            .then((user) => {
                const context = {
                    user,
                    message,
                }
                return context
            })
            .then((context) => conversations.respond(context, this.store))
            .then((response) =>
                this.telegramApi.sendMessage({
                    chat_id: chatId,
                    text: response.text,
                })
            )
            .catch((err) => this.handleError(err, userId, message))
    }

    handleError(err, userId = null, message = null) {
        logger.error('Error while processing message:\n', message,
            '\nuserId:\n', userId, '\nerror:\n', err)
    }
}

module.exports = Bot
