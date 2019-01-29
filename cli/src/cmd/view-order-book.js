const {
    HttpClient
} = require('@0x/connect')

const {
    assetDataUtils,
    orderHashUtils
} = require('@0x/order-utils')

const {
    COMMAND_VIEW_ORDER_BOOK,
    GANACHE_NETWORK_ID,
    SHARE_TYPE_LONG,
    SHARE_TYPE_SHORT
} = require('../utils/constants')

const {
    getContractAddress
} = require('../utils/utils')

const {
    web3
} = require('../web3')

const {
    market
} = require('../contracts')(web3)

// Initialize the Standard Relayer API client
const httpClient = new HttpClient('http://localhost:4444/v2/')

function ViewOrderBook() {

    this.type = COMMAND_VIEW_ORDER_BOOK

    const getArgs = () => require('yargs')
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
            'outcome',
        ], 'Please provide a marketId to view it\'s order books')
        .argv

    const getOrderbook = async (
        marketId,
        outcome,
        shareType
    ) => {
        const outcomeBytes = web3.utils.fromUtf8(outcome)

        const dbetAssetData =
            assetDataUtils.encodeERC20AssetData(getContractAddress('DBETVETToken'))

        const outcomeTokenName = await market.methods.getMarketOutcomeShareTokenName(
            marketId,
            outcomeBytes,
            shareType
        ).call()

        const outcomeTokenAddress = await market.methods.getMarketOutcomeShareToken(
            marketId,
            outcomeTokenName
        ).call()

        const takerAssetData = assetDataUtils.encodeERC20AssetData(outcomeTokenAddress)

        const orderbookRequest = {
            // long = maker -> DBET, taker -> outcome long token
            baseAssetData: dbetAssetData,
            // short = maker -> DBET, taker -> outcome short token
            quoteAssetData: takerAssetData
        }
        const orderbook = await httpClient.getOrderbookAsync(
            orderbookRequest,
            { networkId: GANACHE_NETWORK_ID }
        )
        orderbook.bids.records.map((_order, index) =>
            orderbook.bids.records[index].order.orderHash = orderHashUtils.getOrderHashHex(_order.order)
        )
        orderbook.asks.records.map((_order, index) =>
            orderbook.asks.records[index].order.orderHash = orderHashUtils.getOrderHashHex(_order.order)
        )
        return orderbook
    }

    this.execute = async () => {
        const {
            marketId,
            outcome
        } = getArgs()

        try {
            const longOrderBook = await getOrderbook(
                marketId,
                outcome,
                SHARE_TYPE_LONG
            )

            const shortOrderBook = await getOrderbook(
                marketId,
                outcome,
                SHARE_TYPE_SHORT
            )

            console.log('Retrieved order books:')
            console.log('======================')
            console.log(`${outcome} longs`)
            console.log('Bids: ', longOrderBook.bids.records)
            console.log('Asks: ', longOrderBook.asks.records)
            console.log(`${outcome} shorts`)
            console.log('Bids: ', shortOrderBook.bids.records)
            console.log('Asks: ', shortOrderBook.asks.records)
        } catch (e) {
            console.error('Error retrieving order books', e.stack)
        }
        process.exit()
    }

}

module.exports = new ViewOrderBook()