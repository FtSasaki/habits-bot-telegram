const logger = require('../util/logger')

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

/**
  This function implements the actual logic for the bot.
  @param {ConversationContext} context - context of the current conversation
  @param {Store} store - for data access
  @return {Promise<Response>} the bot's response to the message
 **/
function respond(context, store) {
    const response = {
        text: `Hello, ${ context.user.firstName }!`,
    }
    logger.debug('Conversation context: ', JSON.stringify(context, null, 2),
        '\nResponse: ', JSON.stringify(response, null, 2))
    return Promise.resolve(response)
}

module.exports = {
    respond,
}
