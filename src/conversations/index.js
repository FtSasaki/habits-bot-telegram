const _ = require('lodash')

const logger = require('../util/logger')
const states = require('./states')
const { commandStateHandlers, matchCommand, commandsDescription } = require('./commands')

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
    const stateData = context.user.stateData
    const stateHandler = stateHandlers[state]
    return stateHandler({ context, store })
        .then(({ newState, newStateData, response }) => {
            logger.debug('Conversation context: ', JSON.stringify(context, null, 2),
                '\nState: ', state,
                '\nStateData: ', JSON.stringify(stateData, null, 2),
                '\nResponse: ', JSON.stringify(response, null, 2),
                '\nNew State: ', newState || state,
                '\nNew StateData: ', JSON.stringify(newStateData, null, 2))
            return {
                response,
                newState,
                newStateData,
            }
        })
}

function handleNewUserState({ context }) {
    const response = {
        text: `Nice to meet you, ${ context.user.firstName }!`,
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
        text: `Sorry, I don\'t know what you mean.\nPlease, try next commands:\n\n${commandsDescription}`,
    }
    const newState = states.INITIAL
    return Promise.resolve({ response, newState })
}

module.exports = {
    respond,
}
