const states = require('../states')

const names = ['list', 'all']
const description = 'display all habits you manage'

function handleListHabit({ context, store }) {
    const state = context.user.state
    if (state !== states.INITIAL) {
        throw 'Invalid state'
    }
    const userId = context.user._id
    return store.getHabits({ userId })
        .then((habits) => ({
            response: {
                text: `Here are your habits:\n${ JSON.stringify(habits, null, 2) }`,
            },
            newState: states.INITIAL,
        }))
}

module.exports = {
    name: 'LIST_HABITS',
    matcher: names,
    description: description,
    handlesStates: [],
    handle: handleListHabit,
    states,
}
