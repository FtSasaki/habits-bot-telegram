const states = require('../states')

const names = ['new', 'add']
const description = 'add a new habit'

const acceptedStates = [
    states.NEW_HABIT__ASK_FOR_NAME,
]

function handleNewHabit({ context, store }) {
    const state = context.user.state
    switch (state) {
    case states.INITIAL: {
        return Promise.resolve({
            response: {
                text: 'OK! Now, please describe your habit:',
            },
            newState: states.NEW_HABIT__ASK_FOR_NAME,
        })
    }
    case states.NEW_HABIT__ASK_FOR_NAME: {
        const userId = context.user._id
        const habitName = context.message.text.trim()
        return store.newHabit({
            userId,
            data: {
                name: habitName,
                daysTracked: [],
                dateCreated: new Date(),
            },
        }).then(() => ({
            response: {
                text: `OK! Added new habit: ${ context.message.text }`,
            },
            newState: states.INITIAL,
        }))
    }
    default: {
        throw 'Invalid state'
    }
    }
}

module.exports = {
    name: 'NEW_HABIT',
    matcher: names,
    description: description,
    handlesStates: acceptedStates,
    handle: handleNewHabit,
    states,
}
