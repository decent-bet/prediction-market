const exec = require('child_process').exec

const {
    COMMAND_VIEW_ORDER_BOOK
} = require('../src/utils/constants')

/**
 * View order books for a market's outcome
 * Pass a valid marketId and outcome as parameters
 */
const {
    marketId,
    outcome
} = require('yargs')
    .option('marketId', {
        alias: 'market_id',
        describe: 'Market ID'
    })
    .option('outcome', {
        alias: 'outcome',
        describe: 'Market outcome (in plain text)'
    })
    .demandOption([
        'marketId',
        'outcome'
    ], 'Please provide a valid market ID and outcome (in plain text) to view it\'s orderbook')
    .argv

const command = `node ./index --command ${COMMAND_VIEW_ORDER_BOOK} --marketId ${marketId} --outcome ${outcome}`
console.log('Executing command:', command)
const script = exec(command)

script.stdout.on('data', function(data){
    console.info(data)
})

script.stderr.on('data', function(data){
    console.error(data)
})