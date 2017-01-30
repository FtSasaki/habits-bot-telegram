const _ = require('lodash')
const TelegramApi = require('telegram-bot-api')

const Store = require('../store')
const logger = require('../util/logger')
const conversations = require('../conversations')
const states = require('../conversations/states')

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
        const initialUserData = {
            firstName: telegramMessage.from.first_name,
            lastName: telegramMessage.from.last_name,
            username: telegramMessage.from.username,
            state: states.NEW_USER,
        }
        this.store.updateUser({
            id: userId,
            data: initialUserData,
            upsert: true
        })
            .then((user) => {
                const conversationContext = { user, message }
                return conversations.respond({
                    context: conversationContext,
                    store: this.store,
                })
            })
            .catch((err) =>
                this.telegramApi.sendMessage({
                    chat_id: chatId,
                    text: 'Eh... Something went wrong, please try write to me later.',
                }).then(() => { throw err })
            )
            .then(({ newState, response }) =>
                this.telegramApi.sendMessage({
                    chat_id: chatId,
                    text: response.text,
                }).then(() => newState)
            )
            .then((newState) => this.store.updateUser({
                id: userId,
                data: { state: newState }
            }))
            .catch((err) => this.handleError(err, userId, message))
    }

    handleError(err, userId = null, message = null) {
        logger.error('Error while processing message:\n', message,
            '\nuserId:\n', userId, '\nerror:\n', err)
    }
}

module.exports = Bot
