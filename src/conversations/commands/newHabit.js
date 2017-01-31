const assert = require('assert')
const states = require('../states')

const acceptedStates = [
    states.NEW_HABIT__ASK_FOR_NAME,
]

function handleNewHabit({ context }) {
    const state = context.user.state
    assert(state === states.INITIAL || acceptedStates.includes(state))
    if (state === states.INITIAL) {
        return Promise.resolve({
            response: {
                text: 'OK! Now, please describe your habit:',
            },
            newState: states.NEW_HABIT__ASK_FOR_NAME,
        })
    } else if (state === states.NEW_HABIT__ASK_FOR_NAME) {
        return Promise.resolve({
            response: {
                text: `OK! Added new habit: ${ context.message.text }`,
            },
            newState: states.INITIAL,
        })
    }
    return Promise.reject('Invalid state')
}

module.exports = {
    name: 'NEW_HABIT',
    matcher: ['new', 'add'],
    handlesStates: acceptedStates,
    handle: handleNewHabit,
}
