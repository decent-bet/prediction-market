const {
    assetDataUtils,
    orderHashUtils,
    signatureUtils
} = require('@0x/order-utils')

const {
    HttpClient
} = require('@0x/connect')

const { TransactionEncoder } = require('@0x/contract-wrappers')
const { ExchangeContract } = require('@0x/abi-gen-wrappers')

const {
    COMMAND_FILL_ORDER,
    GANACHE_NETWORK_ID,
    SHARE_TYPE_LONG
} = require('../utils/constants')

const {
    getContractAddress
} = require('../utils/utils')

const {
    takerAddress,
    web3
} = require('../web3')

const {
    bettingExchange,
    exchange,
    market
} = require('../contracts')(web3)

// Initialize the Standard Relayer API client
const httpClient = new HttpClient('http://localhost:4444/v2/')

let exchangeWrapper
let transactionEncoder

function FillOrder() {

    this.type = COMMAND_FILL_ORDER

    const getArgs = () => require('yargs')
        .option('marketId', {
            alias: 'market_id',
            describe: 'Market ID'
        })
        .option('outcome', {
            alias: 'outcome',
            describe: 'Market outcome (in plain text)'
        })
        .option('shareType', {
            alias: 'share_type',
            describe: 'Share type (long/short)'
        })
        .option('orderHash', {
            alias: 'order_hash',
            describe: 'Order hash'
        })
        .option('fillAmount', {
            alias: 'fill_amount',
            describe: 'Amount in DBETs to fill as the taker'
        })
        .demandOption([
            'marketId',
            'outcome',
            'shareType',
            'orderHash',
            'fillAmount',
        ], 'Please provide order related data to fill the order')
        .argv

    const convertOrderToTuple = order => {
        const keys = [
            'makerAddress',
            'takerAddress',
            'feeRecipientAddress',
            'senderAddress',
            'makerAssetAmount',
            'takerAssetAmount',
            'makerFee',
            'takerFee',
            'expirationTimeSeconds',
            'salt',
            'makerAssetData',
            'takerAssetData'
        ]
        const tuple = []
        keys.forEach(key => tuple.push(order[key].toString()))
        return tuple
    }

    this.execute = async () => {
        exchangeWrapper = new ExchangeContract(
            exchange.options.jsonInterface,
            exchange.options.address,
            web3.currentProvider,
            {}
        )

        transactionEncoder = new TransactionEncoder(
            exchangeWrapper
        )

        const {
            marketId,
            outcome,
            shareType,
            orderHash,
            fillAmount
        } = getArgs()

        const isLong = shareType === SHARE_TYPE_LONG

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

        const makerAssetData = dbetAssetData
        const takerAssetData = assetDataUtils.encodeERC20AssetData(outcomeTokenAddress)

        const orderbookRequest = {
            // long = maker -> DBET, taker -> outcome long token
            baseAssetData: makerAssetData,
            // short = maker -> DBET, taker -> outcome short token
            quoteAssetData: takerAssetData
        }
        const response = await httpClient.getOrderbookAsync(
            orderbookRequest,
            { networkId: GANACHE_NETWORK_ID }
        )

        if (response.asks.total === 0)
            throw new Error('No orders found on the relayer')

        let orderToFill

        response.asks.records.forEach(async _order => {
            const {
                order
            } = _order
            if(orderHashUtils.getOrderHashHex(order) === orderHash)
                orderToFill = order
        })

        if(orderToFill) {
            console.log(`Order ${orderHash} is available`)

            const fillOrderData = exchangeWrapper.fillOrder.getABIEncodedTransactionData(
                orderToFill,
                orderToFill.takerAssetAmount,
                orderToFill.signature
            )
            const zeroExTxHash = transactionEncoder.getTransactionHex(
                fillOrderData,
                orderToFill.salt,
                takerAddress.toLowerCase()
            )
            const takerTxSignature = await signatureUtils.ecSignHashAsync(
                web3.currentProvider,
                zeroExTxHash,
                takerAddress
            )

            /**
             * Skip since taker balance isn't minted until fillOrder is called
             * TODO: Create custom validation function skipping balance checks for long/short token balances
             * **/
            // Validate the order is fillable given the maker and taker balances
            // await contractWrappers.exchange.validateFillOrderThrowIfInvalidAsync(
            //     order,
            //     new BigNumber(fillAmount),
            //     takerAddress
            // )

            try {
                console.log('Sending fill order tx',
                    {
                        marketId,
                        outcome: web3.utils.fromUtf8(outcome),
                        isLong,
                        order: convertOrderToTuple(orderToFill),
                        fillAmount: orderToFill.takerAssetAmount,
                        salt: web3.utils.toHex(orderToFill.salt),
                        makerSignature: orderToFill.signature,
                        takerTxSignature
                    }
                )
                const tx =
                    await bettingExchange.methods.fillOrder(
                        marketId,
                        web3.utils.fromUtf8(outcome),
                        isLong,
                        convertOrderToTuple(orderToFill),
                        web3.utils.toHex(orderToFill.takerAssetAmount),
                        web3.utils.toHex(orderToFill.salt),
                        orderToFill.signature,
                        takerTxSignature
                    ).send({
                        from: takerAddress,
                        gas: 6700000
                    })

                console.log(`Successfully filled order ${orderHash}.`)
                console.log('Tx hash =', tx.transactionHash)
            } catch (e) {
                console.error('Error sending tx', e.stack)
            }
        }

        if(!orderToFill)
            throw new Error(`Order ${orderHash} is not stored in the relayer`)

        process.exit()
    }

}

module.exports = new FillOrder()