const _ = require('lodash')
const TelegramApi = require('telegram-bot-api')

const Store = require('../store')
const logger = require('../util/logger')
const conversations = require('../conversations')
const states = require('../conversations/states')

function serializeResponse(response) {
    const serializedResponse = {}
    for (var key in response) {
        const value = response[key]
        if (key === 'reply_markup') {
            serializedResponse[key] = JSON.stringify(value)
        } else {
            serializedResponse[key] = value
        }
    }
    return serializedResponse
}

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
        this.telegramApi.on('inline.callback.query', this.onMessage)
        return Promise.resolve()
    }

    onMessage(data) {
        logger.debug('Bot.onMessage: ', JSON.stringify(data, null, 2))

        if (!data) {
            return
        }
        const chat = data.chat || (data.message && data.message.chat)
        const userFrom = data.from || (data.message && data.message.from)
        if (!chat || !userFrom) {
            return
        }
        const chatId = chat.id
        const message = {
            text: data.text || null,
            data: data.data || null,
        }

        const userId = userFrom.id
        const initialUserData = {
            firstName: userFrom.first_name,
            lastName: userFrom.last_name,
            username: userFrom.username,
            state: states.NEW_USER,
            stateData: {},
        }
        this.store.getOrCreateUser({
            id: userId,
            data: initialUserData,
        })
            .then((user) => {
                const conversationContext = { user, message }
                return conversations.respond({
                    context: conversationContext,
                    store: this.store,
                })
            })
            .catch((err) => {
                this.handleError(err, userId, message)
                return {
                    newState: states.INITIAL,
                    newStateData: {},
                    response: {
                        text: 'Something went wrong while processing your command.',
                    },
                }
            })
            .then(({ newState, newStateData, response }) => {
                let telegramApiAction
                if (response.replaceMessage) {
                    telegramApiAction = this.telegramApi.editMessageText(
                        _.merge(serializeResponse(response), {
                            message_id: response.replaceMessage,
                            chat_id: chatId,
                        }))
                } else {
                    telegramApiAction = this.telegramApi.sendMessage(
                        _.merge({ chat_id: chatId }, serializeResponse(response))
                    )
                }
                return telegramApiAction.then((sentMessage) => {
                    const stateData = newStateData || {}
                    if (response.saveThisMessageInStateData) {
                        stateData.lastSentMessage = sentMessage
                    }
                    return {
                        newState,
                        newStateData: stateData,
                    }
                })
            })
            .then(({ newState, newStateData }) => {
                const userUpdateData = {
                    stateData: newStateData,
                }
                if (newState) {
                    userUpdateData.state = newState
                }
                return this.store.updateUser({
                    id: userId,
                    data: userUpdateData,
                })
            })
            .catch((err) => {
                this.telegramApi.sendMessage({
                    chat_id: chatId,
                    text: 'Something went wrong while processing your command.',
                }).then(() => { throw err })
            })
            .catch((err) => this.handleError(err, userId, message))
    }

    handleError(err, userId = null, message = null) {
        logger.error('Error while processing message:\n', message,
            '\nuserId:\n', userId, '\nerror:\n', err)
    }
}

module.exports = Bot
