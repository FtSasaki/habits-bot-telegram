const _ = require('lodash')
const states = require('../states')

const names = ['delete', 'remove']
const description = 'remove a habit'

const acceptedStates = [
    states.DELETE_HABIT__CHOOSE,
]

function handleDeleteHabit({ context, store }) {
    const state = context.user.state
    const userId = context.user._id
    switch (state) {
    case states.INITIAL: {
        return store.getHabits({ userId })
            .then((habits) => {
                if (!habits || habits.length === 0) {
                    return {
                        response: {
                            text: 'You aren\'t tracking any habits. Please send me /new to start tracking a new one.',
                        },
                        newState: states.INITIAL,
                    }
                }
                return {
                    response: {
                        text: 'Choose a habit to delete:',
                        reply_markup: {
                            inline_keyboard: _.map(habits, (habit) => ([{
                                text: habit.name,
                                callback_data: habit._id,
                            }])),
                        },
                        saveThisMessageInStateData: true,
                    },
                    newState: states.DELETE_HABIT__CHOOSE,
                }
            })
    }
    case states.DELETE_HABIT__CHOOSE: {
        const habitId = context.message.data
        if (!habitId) {
            return Promise.resolve({
                response: {
                    text: 'Please, select one option from the list above.',
                },
                newStateData: context.user.stateData,
            })
        }
        const lastSentMessage = context.user.stateData.lastSentMessage
        const lastSentMessageId = lastSentMessage.message_id
        return store.deleteHabit({ userId, id: habitId })
            .then((habit) => {
                let text
                if (habit) {
                    text = `OK, deleted habit ${ habit.name }`
                } else {
                    text = 'This habit was already removed'
                }
                return {
                    response: {
                        text,
                        replaceMessage: lastSentMessageId,
                    },
                    newState: states.INITIAL,
                }
            })
    }
    default: {
        throw 'Invalid state'
    }
    }
}

module.exports = {
    name: 'DELETE_HABIT',
    matcher: names,
    description: description,
    handlesStates: acceptedStates,
    handle: handleDeleteHabit,
    states,
}
