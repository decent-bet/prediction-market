const exec = require('child_process').exec

const {
    COMMAND_CLAIM_WINNING_OUTCOME_SHARE_TOKENS
} = require('../src/utils/constants')

/**
 * Claim favorable outcome share tokens from a resolved market
 * Pass a valid marketId and if the address is maker (boolean) as parameters
 */
const {
    marketId,
    isMaker
} = require('yargs')
    .option('marketId', {
        alias: 'market_id',
        describe: 'Market ID'
    })
    .option('isMaker', {
        alias: 'is_maker',
        describe: 'Whether to use maker or taker address when calling the claim function'
    })
    .demandOption([
            'marketId',
            'isMaker',
        ],
        'Please provide a valid market ID and whether the calling address is the maker to claim ' +
        'winning outcome share tokens'
    )
    .argv

const command = `node ./index --command ${COMMAND_CLAIM_WINNING_OUTCOME_SHARE_TOKENS} --marketId ${marketId} --isMaker ${isMaker}`
console.log('Executing command:', command)
const script = exec(command)

script.stdout.on('data', function(data){
    console.info(data)
})

script.stderr.on('data', function(data){
    console.error(data)
})