const _ = require('lodash')

const logger = require('../util/logger')
const states = require('./states')
const { commandStateHandlers, matchCommand } = require('./commands')

/**
  @typedef User
  @type {object}
  @property {string} _id - the user's ID
  @property {string} fisrtName
  @property {string} lastName
**/

 /**
   @typedef Message
   @type {object}
   @property {string} text - the text content of the message
 **/

 /**
   @typedef Response
   @type {object}
   @property {string} text - the text content of the message
 **/

/**
  @typedef ConversationContext
  @type {object}
  @property {User} user
  @property {Message} message
**/

const stateHandlers = _.merge({
    [states.NEW_USER]: handleNewUserState,
    [states.INITIAL]: handleInitialState,
}, commandStateHandlers)

/**
  This function implements the actual logic for the bot.
  It dispatches handling of conversation to a function from
  stateHandlers map, depending on the current state of the conversation.

  @param {ConversationContext} context - context of the current conversation
  @param {Store} store - for data access
  @return {Promise<Response>} the bot's response to the message
 **/
function respond({ context, store }) {
    const state = context.user.state
    const stateHandler = stateHandlers[state]
    return stateHandler({ context, store })
        .then(({ newState, response }) => {
            logger.debug('Conversation context: ', JSON.stringify(context, null, 2),
                '\nState: ', state,
                '\nResponse: ', JSON.stringify(response, null, 2),
                '\nNew state: ', newState)
            return {
                response,
                newState,
            }
        })
}

function handleNewUserState(context) {
    const response = {
        text: `Nice to meet you, ${ context.user.firstName }!
From now on, we're old friends! Unless you send me "forget me", of course.`,
    }
    const newState = states.INITIAL
    return Promise.resolve({ response, newState })
}

function handleInitialState({ context, store }) {
    const message = context.message.text
    const command = matchCommand(message)
    if (command) {
        return command.handle({ context, store })
    }
    const response = {
        text: 'Sorry, I don\'t know what you mean.\nPlease, try the only command I understand: "/new". :(',
    }
    const newState = states.INITIAL
    return Promise.resolve({ response, newState })
}

module.exports = {
    respond,
}
