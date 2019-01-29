const {
    BigNumber
} = require('0x.js')

const {
    assetDataUtils,
    orderHashUtils,
    signatureUtils,
    generatePseudoRandomSalt
} = require('@0x/order-utils')

const { Web3Wrapper } = require('@0x/web3-wrapper')

const {
    HttpClient
} = require('@0x/connect')

const { web3 } = require('../web3')
const { providerEngine } = require('../web3/provider-engine')

const {
    COMMAND_PLACE_ORDER,
    SHARE_TYPE_LONG,
    SHARE_TYPE_SHORT,
    DECIMALS,
    NULL_ADDRESS,
    GANACHE_NETWORK_ID
} = require('../utils/constants')

const {
    getTimestamp,
    getContractAddress
} = require('../utils/utils')

const {
    market
} = require('../contracts')(web3)

const {
    contractWrappers,
    makerAddress
} = require('../web3')

// Initialize the Standard Relayer API client
const httpClient = new HttpClient('http://localhost:4444/v2/')

function PlaceOrder() {

    this.type = COMMAND_PLACE_ORDER

    const getArgs = () => require('yargs')
        .option('marketId', {
            alias: 'market_id',
            describe: 'Market ID'
        })
        .option('outcome', {
            alias: 'outcome',
            describe: 'Market outcome (in plain text)'
        })
        .option('dbetAmount', {
            alias: 'dbet_amount',
            describe: 'Number of DBETs to bid'
        })
        .option('shareAmount', {
            alias: 'share_amount',
            describe: 'Number of outcome longs/shorts to ask'
        })
        .option('shareType', {
            alias: 'share_type',
            describe: 'Type of share to bid on - long/short (long = bid, short = ask)'
        })
        .demandOption([
            'marketId',
            'outcome',
            'dbetAmount',
            'shareAmount',
            'shareType'
        ], 'Please provide order related data to place an order')
        .argv

    this.execute = async () => {
        const {
            marketId,
            outcome,
            dbetAmount,
            shareAmount,
            shareType
        } = getArgs()

        if (shareType === SHARE_TYPE_LONG) {
            try {
                const outcomeBytes = web3.utils.fromUtf8(outcome)

                const outcomeLongTokenName = await market.methods.getMarketOutcomeShareTokenName(
                    marketId,
                    outcomeBytes,
                    shareType
                ).call()

                const outcomeLongTokenAddress = await market.methods.getMarketOutcomeShareToken(
                    marketId,
                    outcomeLongTokenName
                ).call()

                // Maker asset = DBET, taker asset = Outcome longs
                const makerAssetData =
                    assetDataUtils.encodeERC20AssetData(getContractAddress('DBETVETToken'))

                // Outcome long tokens
                const takerAssetData =
                    assetDataUtils.encodeERC20AssetData(outcomeLongTokenAddress)

                const makerAssetAmount = Web3Wrapper.toBaseUnitAmount(new BigNumber(dbetAmount), DECIMALS)
                const takerAssetAmount = Web3Wrapper.toBaseUnitAmount(new BigNumber(shareAmount), DECIMALS)

                const expiration = await getTimestamp(web3) + 86400 // 1 day in the future

                const exchangeAddress = getContractAddress('Exchange')

                const orderConfigRequest = {
                    exchangeAddress,
                    makerAddress: makerAddress.toLowerCase(),
                    takerAddress: NULL_ADDRESS,
                    expirationTimeSeconds: new BigNumber(expiration),
                    makerAssetAmount,
                    takerAssetAmount,
                    makerAssetData,
                    takerAssetData,
                }

                const orderConfig = await httpClient.getOrderConfigAsync(orderConfigRequest, {
                    networkId: GANACHE_NETWORK_ID
                })

                const order = {
                    salt: generatePseudoRandomSalt().toString().slice(0, 20),
                    ...orderConfigRequest,
                    ...orderConfig
                }

                const orderHashHex = orderHashUtils.getOrderHashHex(order)
                const signature = await signatureUtils.ecSignHashAsync(
                    providerEngine,
                    orderHashHex,
                    orderConfigRequest.makerAddress
                )
                const signedOrder = {
                    ...order,
                    signature
                }

                // Validate this order
                console.log('Signed order', signedOrder)
                await contractWrappers.exchange.validateOrderFillableOrThrowAsync(signedOrder)

                // Submit the order to the SRA Endpoint
                await httpClient.submitOrderAsync(
                    signedOrder,
                    { networkId: GANACHE_NETWORK_ID }
                )
                console.log(`Successfully submitted ${shareType} order to relayer`)
            } catch (e) {
                console.error('Error placing order', e.stack)
            }
        } else if(shareType === SHARE_TYPE_SHORT) {
            try {
                const outcomeBytes = web3.utils.fromUtf8(outcome)

                const outcomeShortTokenName = await market.methods.getMarketOutcomeShareTokenName(
                    marketId,
                    outcomeBytes,
                    shareType
                ).call()

                const outcomeShortTokenAddress = await market.methods.getMarketOutcomeShareToken(
                    marketId,
                    outcomeShortTokenName
                ).call()

                // Maker asset = DBETs, taker asset = Outcome shorts
                const makerAssetData =
                    assetDataUtils.encodeERC20AssetData(getContractAddress('DBETVETToken'))

                // DBETs
                const takerAssetData =
                    assetDataUtils.encodeERC20AssetData(outcomeShortTokenAddress)

                const makerAssetAmount = Web3Wrapper.toBaseUnitAmount(new BigNumber(dbetAmount), DECIMALS)
                const takerAssetAmount = Web3Wrapper.toBaseUnitAmount(new BigNumber(shareAmount), DECIMALS)

                const expiration = await getTimestamp(web3) + 86400 // 1 day in the future

                const exchangeAddress = getContractAddress('Exchange')

                const orderConfigRequest = {
                    exchangeAddress,
                    makerAddress: makerAddress.toLowerCase(),
                    takerAddress: NULL_ADDRESS,
                    expirationTimeSeconds: new BigNumber(expiration),
                    makerAssetAmount,
                    takerAssetAmount,
                    makerAssetData,
                    takerAssetData,
                }

                const orderConfig = await httpClient.getOrderConfigAsync(orderConfigRequest, {
                    networkId: GANACHE_NETWORK_ID
                })

                const order = {
                    salt: generatePseudoRandomSalt().toString().slice(0, 20),
                    ...orderConfigRequest,
                    ...orderConfig
                }

                const orderHashHex = orderHashUtils.getOrderHashHex(order)
                const signature = await signatureUtils.ecSignHashAsync(
                    providerEngine,
                    orderHashHex,
                    orderConfigRequest.makerAddress
                )
                const signedOrder = { ...order, signature }

                // Validate this order
                await contractWrappers.exchange.validateOrderFillableOrThrowAsync(signedOrder)

                // Submit the order to the SRA Endpoint
                await httpClient.submitOrderAsync(
                    signedOrder,
                    { networkId: GANACHE_NETWORK_ID }
                )
                console.log(`Successfully submitted ${shareType} order to relayer`)
            } catch (e) {
                console.error('Error placing order', e.stack)
            }
        } else
            throw new Error('Invalid share type')

        // Since web3 doesn't terminate
        process.exit()
    }

}

module.exports = new PlaceOrder()