const logger = require('../util/logger')
const constants = require('../constants')
const states = constants.conversationStates

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

const stateHandlers = {
    [states.NEW_USER]: handleNewUserState,
    [states.INITIAL]: handleInitialState,
}

/**
  This function implements the actual logic for the bot.
  It dispatches handling of conversation to a function from
  stateHandlers map, depending on the current state of the conversation.

  @param {ConversationContext} context - context of the current conversation
  @param {Store} store - for data access
  @return {Promise<Response>} the bot's response to the message
 **/
function respond(context, store) {
    const state = context.user.state
    const stateHandler = stateHandlers[state]
    return stateHandler(context, store)
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

function handleInitialState(context) {
    const message = context.message.text
    let responseText, newState
    if (message === 'forget me') {
        responseText = 'All right, I will forget you... Who are you, stranger?'
        newState = states.NEW_USER
    } else {
        responseText = `Welcome back, my old friend ${ context.user.firstName }!`
        newState = states.INITIAL
    }
    const response = {
        text: responseText,
        newState,
    }
    return Promise.resolve({ response, newState })
}

module.exports = {
    respond,
}
