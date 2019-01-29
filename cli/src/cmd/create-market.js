const {
    COMMAND_CREATE_MARKET,
} = require('../utils/constants')

const {
    ownerAddress,
    web3
} = require('../web3')

const {
    market
} = require('../contracts')(web3)

function CreateMarket() {

    this.type = COMMAND_CREATE_MARKET

    const getArgs = () => require('yargs')
        .option('marketType', {
            alias: 'market_type',
            describe: 'Market type (P2P/One-sided)',
            default: 1
        })
        .option('eventStart', {
            alias: 'event_start',
            describe: 'Event start timestamp'
        })
        .option('marketOpen', {
            alias: 'market_open',
            describe: 'Market open timestamp'
        })
        .option('marketClose', {
            alias: 'market_close',
            describe: 'Market close timestamp'
        })
        .option('outcomes', {
            alias: 'outcomes',
            type: 'array',
            describe: 'Outcomes'
        })
        .option('minBet', {
            alias: 'min_bet',
            describe: 'Minimum bet',
            default: web3.utils.toWei('1', 'ether')
        })
        .option('maxBet', {
            alias: 'max_bet',
            describe: 'Maximum bet',
            default: web3.utils.toWei('1000', 'ether')
        })
        .option('ipfsHash', {
            alias: 'ipfs_hash',
            describe: 'IPFS hash',
            default: '0x92839d69320d8117b26219b5dfd355d2a748b821'
        })
        .demandOption([
            'eventStart',
            'outcomes',
            'marketOpen',
            'marketClose'
        ], 'Please provide event related data to create a betting market')
        .argv

    this.execute = async () => {
        const {
            marketType,
            eventStart,
            marketOpen,
            marketClose,
            outcomes,
            minBet,
            maxBet,
            ipfsHash
        } = getArgs()

        // Default category ID
        const categoryId = 1

        // Convert outcomes to bytes32 hex
        const bytes32Outcomes = outcomes.map(outcome => web3.utils.fromUtf8(outcome))

        try {
            console.info(`Creating market with args:`)
            console.info({
                marketType,
                categoryId,
                eventStart,
                marketOpen,
                marketClose,
                outcomes: bytes32Outcomes,
                minBet,
                maxBet,
                ipfsHash
            })

            const tx = await market.methods.createBettingMarket(
                marketType,
                categoryId,
                eventStart,
                marketOpen,
                marketClose,
                bytes32Outcomes,
                minBet,
                maxBet,
                ipfsHash
            ).send({
                from: ownerAddress,
                gas: 8000000
            })
            const marketId = tx.events['LogNewMarket'].returnValues.id
            const outcomeShareTokens = []
            tx.events['LogNewOutcomeShareToken'].map(event => {
                outcomeShareTokens.push({
                    outcome: event.returnValues.outcome,
                    shareType: event.returnValues._type,
                    name: event.returnValues.name,
                    address: event.returnValues._address
                })
            })
            console.log(`Successfully created betting market - Market ID: ${marketId}`)
            console.log('Outcome share tokens: ', outcomeShareTokens)
        } catch (e) {
            console.error('Error creating market', e.stack)
        }

        // Since web3 doesn't end it's connection
        process.exit()
    }
}

module.exports = new CreateMarket()