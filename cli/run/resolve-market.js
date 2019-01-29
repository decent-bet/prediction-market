const exec = require('child_process').exec

const {
    COMMAND_RESOLVE_MARKET
} = require('../src/utils/constants')

/**
 * Resolves a market with a winning outcome
 * Pass a valid marketId and outcome as parameters
 */
const {
    marketId,
    winningOutcome
} = require('yargs')
    .option('marketId', {
        alias: 'market_id',
        describe: 'Market ID'
    })
    .option('winningOutcome', {
        alias: 'winning_outcome',
        describe: 'Winning outcome (in plain text)'
    })
    .demandOption([
        'marketId',
        'winningOutcome'
    ], 'Please provide a valid market ID and winning outcome (in plain text) to resolve a market')
    .argv

const command = `node ./index --command ${COMMAND_RESOLVE_MARKET} --marketId ${marketId} --winningOutcome ${winningOutcome}`
console.log('Executing command:', command)
const script = exec(command)

script.stdout.on('data', function(data){
    console.info(data)
})

script.stderr.on('data', function(data){
    console.error(data)
})