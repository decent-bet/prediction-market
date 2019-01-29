const exec = require('child_process').exec

const {
    COMMAND_FILL_ORDER
} = require('../src/utils/constants')

/**
 * Opens long and short positions as maker/taker
 * Pass a valid marketId and outcome as parameters
 */
const {
    marketId,
    outcome,
    orderHash,
    shareType
} = require('yargs')
    .option('marketId', {
        alias: 'market_id',
        describe: 'Market ID'
    })
    .option('outcome', {
        alias: 'outcome',
        describe: 'Market outcome (in plain text)'
    })
    .option('orderHash', {
        alias: 'order_hash',
        describe: 'Order hash'
    })
    .option('shareType', {
        alias: 'share_type',
        describe: 'Type of share in order'
    })
    .demandOption([
        'marketId',
        'outcome',
        'orderHash',
        'shareType'
    ], 'Please provide a valid market ID, outcome (in plain text) and order hash to fill an order')
    .argv

const fillAmount = 100

const command = `node ./index --command ${COMMAND_FILL_ORDER} --marketId ${marketId} --outcome ${outcome} --orderHash ${orderHash} --shareType ${shareType} --fillAmount ${fillAmount}`
console.log('Executing command:', command)
const script = exec(command)

script.stdout.on('data', function(data){
    console.info(data)
})

script.stderr.on('data', function(data){
    console.error(data)
})