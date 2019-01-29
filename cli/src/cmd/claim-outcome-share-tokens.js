const {
    COMMAND_CLAIM_WINNING_OUTCOME_SHARE_TOKENS,
} = require('../utils/constants')

const {
    makerAddress,
    takerAddress,
    web3
} = require('../web3')

const {
    market
} = require('../contracts')(web3)

function ClaimOutcomeShareTokens() {

    this.type = COMMAND_CLAIM_WINNING_OUTCOME_SHARE_TOKENS

    const getArgs = () => require('yargs')
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

    this.execute = async () => {
        const {
            marketId,
            isMaker
        } = getArgs()

        try {
            const tx = await market.methods.redeemFavorableOutcomeShares(
                marketId
            ).send({
                from: isMaker ? makerAddress : takerAddress,
                gas: 6700000
            })
            console.log(`Successfully claimed outcome share tokens for market: ${marketId}`)
        } catch (e) {
            console.error('Error resolving market', e.stack)
        }

        // Since web3 doesn't end it's connection
        process.exit()
    }

}

module.exports = new ClaimOutcomeShareTokens()