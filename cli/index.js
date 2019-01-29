const {
    COMMAND_APPROVE_DBETS,
    COMMAND_CREATE_MARKET,
    COMMAND_PLACE_ORDER,
    COMMAND_FILL_ORDER,
    COMMAND_CANCEL_ORDER,
    COMMAND_VIEW_ORDER_BOOK,
    COMMAND_RESOLVE_MARKET,
    COMMAND_CLAIM_WINNING_OUTCOME_SHARE_TOKENS
} = require('./src/utils/constants')

const {commands} = require('./src/cmd')

const commandTypeArgs = require('yargs')
    .option('command', {
        alias: 'cmd',
        describe: 'command to run'
    })
    .demandOption(['command'], 'Please provide the command to run')
    .usage(
        `Available command types - ${COMMAND_APPROVE_DBETS}, ${COMMAND_CREATE_MARKET}, ${COMMAND_PLACE_ORDER}, ${COMMAND_FILL_ORDER}, ${COMMAND_CANCEL_ORDER}, ${COMMAND_VIEW_ORDER_BOOK}, ${COMMAND_RESOLVE_MARKET}, ${COMMAND_CLAIM_WINNING_OUTCOME_SHARE_TOKENS}`
    )
    .argv

let isValid

commands.forEach(async (cmd, index) => {
    if(cmd.type === commandTypeArgs.cmd) {
        isValid = true
        await cmd.execute()
    }

    if(index === commands.length - 1 && !isValid)
        throw new Error('Invalid command type')
})