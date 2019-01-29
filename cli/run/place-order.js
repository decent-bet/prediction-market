const exec = require('child_process').exec

const {
    SHARE_TYPE_LONG,
    SHARE_TYPE_SHORT,
    COMMAND_PLACE_ORDER
} = require('../src/utils/constants')

/**
 * Opens long and short positions as maker/taker
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
    ], 'Please provide a valid market ID and outcome (in plain text) to place an order')
    .argv

const longDbetAmount = 100
const longShareAmount = 500

const shortDbetAmount = 100
const shortShareAmount = 400

const placeOrder = shareType => {
    const isLong = shareType === SHARE_TYPE_LONG
    const dbetAmount = isLong ? longDbetAmount : shortDbetAmount
    const shareAmount = isLong ? longShareAmount : shortShareAmount
    const command = `node ./index --command ${COMMAND_PLACE_ORDER} --marketId ${marketId} --outcome ${outcome} --dbetAmount ${dbetAmount} --shareAmount ${shareAmount} --shareType ${shareType}`
    console.log('Executing', shareType, 'command:', command)
    const script = exec(command)

    script.stdout.on('data', function(data){
        console.info(data)
    })

    script.stderr.on('data', function(data){
        console.error(data)
    })
}

placeOrder(SHARE_TYPE_LONG)
placeOrder(SHARE_TYPE_SHORT)