const commands = [
    require('./newHabit'),
    require('./deleteHabit'),
    require('./listHabits'),
]

function getCommandStateHandlers(commands) {
    let stateHandlers = {}
    commands.forEach((command) => {
        command.handlesStates.forEach((state) => {
            stateHandlers[state] = command.handle
        })
    })
    return stateHandlers
}

const commandStateHandlers = getCommandStateHandlers(commands)

function matchCommand(text) {
    if (!text) {
        return null
    }
    const processedText = text.trim().toLowerCase()
    const match = processedText.match(/^\/(\w+)/)
    if (!match || match.length != 2) {
        return null
    }
    const commandName = match[1]
    for (var command of commands) {
        if (command.matcher.includes(commandName)) {
            return command
        }
    }
    return null
}

module.exports = {
    commands,
    matchCommand,
    commandStateHandlers,
}
