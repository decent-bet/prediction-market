const exec = require('child_process').exec
const {
    getTimestamp
} = require('../src/utils/utils')

const {
    COMMAND_CREATE_MARKET
} = require('../src/utils/constants')

const {
    web3
} = require('../src/web3')

const formatOutcomes = outcomes => {
    let formattedOutcomes = ''
    outcomes.map((outcome, index) => {
        formattedOutcomes += outcome
        if(index !== outcomes.length - 1)
            formattedOutcomes += ' '
    })
    return formattedOutcomes
}

const createMarket = async () => {
    const timestamp   = await getTimestamp(web3)
    const eventStart  = timestamp  + (3 * 60 * 60) // 1h in the future
    const marketOpen  = timestamp  + 60        // 1m in the future
    const marketClose = eventStart - 60        // 1m before eventStart
    // TODO: Implement EIP-1167 to clone ERC20 share token contracts for multiple outcomes (until that's done, gas requirement is too much for more than 3 outcomes)
    const outcomes = formatOutcomes([
        'teamA',
        'teamB'
    ])

    const command = `node ./index --command ${COMMAND_CREATE_MARKET} --eventStart ${eventStart} --marketOpen ${marketOpen} --marketClose ${marketClose} --outcomes ${outcomes}`
    console.log('Executing command:', command)
    const script = exec(command)

    script.stdout.on('data', function(data){
        console.info(data)
    })

    script.stderr.on('data', function(data){
        console.error(data)
    })
}

createMarket()