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

function getCommandsDescription(commands) {
    let description = ''
    commands.forEach((command) => {
        let mainName = `/${command.matcher[0]}`
        let aliases = `${command.matcher.slice(1).map((name) => '/' + name).join(', ')}`
        description = description + `${mainName} (${aliases}) - ${command.description} \n`
    })
    return description
}

const commandStateHandlers = getCommandStateHandlers(commands)
const commandsDescription = getCommandsDescription(commands)

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
    for (let command of commands) {
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
    commandsDescription,
}
