const {
    BigNumber
} = require('0x.js')

const {
    COMMAND_RESOLVE_MARKET,
} = require('../utils/constants')

const {
    getTimestamp,
    timeTravel
} = require('../utils/utils')

const {
    ownerAddress,
    web3
} = require('../web3')

const {
    market
} = require('../contracts')(web3)

function ResolveMarket() {

    this.type = COMMAND_RESOLVE_MARKET

    const getArgs = () => require('yargs')
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
            'winningOutcome',
        ], 'Please provide a marketId and valid winning outcome (in plain text) to resolve a market')
        .argv

    this.execute = async () => {
        const {
            marketId,
            winningOutcome
        } = getArgs()

        try {
            const marketInfo = await market.methods.getMarketInfo(marketId).call()
            const eventClose = marketInfo[3]

            // Forward time in ganache-cli to eventClose
            const timestamp = await getTimestamp(web3)
            const timeDifference = new BigNumber(eventClose)
                .minus(timestamp)
                .plus(60) // Additional buffer amount (1 min)
                .toString()

            await timeTravel(
                web3,
                timeDifference
            )

            const tx = await market.methods.resolveMarket(
                marketId,
                web3.utils.fromUtf8(winningOutcome)
            ).send({
                from: ownerAddress,
                gas: 6700000
            })
            console.log(`Successfully resolved betting market - Market ID: ${marketId}`)
        } catch (e) {
            console.error('Error resolving market', e.stack)
        }

        // Since web3 doesn't end it's connection
        process.exit()
    }

}

module.exports = new ResolveMarket()