import {createAction} from 'redux-actions'

import {
    TOGGLE_BASE_DIALOG,
    TOGGLE_APPROVE_TOKENS_DIALOG,
    TOGGLE_CREATE_BETTING_MARKET_DIALOG,
    TOGGLE_FILL_ORDER_DIALOG,
    TOGGLE_DRAWER,
    SET_DRAWER,
    CLOSE_DRAWER,
    SET_BETTING_MARKET_NAME,
    SET_BETTING_MARKET_DESCRIPTION,
    SET_BETTING_MARKET_CATEGORY,
    SET_MARKET_OUTCOME_NAME,
    ADD_MARKET_OUTCOME,
    REMOVE_MARKET_OUTCOME,
    UPDATE_MARKET_TIMES,
    CREATE_BETTING_MARKET_ERROR,
    CREATE_BETTING_MARKET_LOADING,
    CREATE_BETTING_MARKET_SUCCESS,
    LOAD_AVAILABLE_MARKETS_ERROR,
    LOAD_AVAILABLE_MARKETS_LOADING,
    LOAD_AVAILABLE_MARKETS_SUCCESS,
    GET_OUTCOME_SHARE_TOKEN_ORDER_BOOK_ERROR,
    GET_OUTCOME_SHARE_TOKEN_ORDER_BOOK_LOADING,
    GET_OUTCOME_SHARE_TOKEN_ORDER_BOOK_SUCCESS,
    APPROVE_TOKENS_ERROR,
    APPROVE_TOKENS_LOADING,
    APPROVE_TOKENS_SUCCESS,
    SET_PLACE_ORDER_PRICE,
    SET_PLACE_ORDER_QUANTITY,
    PLACE_ORDER_ERROR,
    PLACE_ORDER_LOADING,
    PLACE_ORDER_SUCCESS,
    FILL_ORDER_ERROR,
    FILL_ORDER_LOADING,
    FILL_ORDER_SUCCESS,
    GET_TRADE_ALLOWANCES_ERROR,
    GET_TRADE_ALLOWANCES_LOADING,
    GET_TRADE_ALLOWANCES_SUCCESS,
    GET_TOKEN_BALANCE_ERROR,
    GET_TOKEN_BALANCE_LOADING,
    GET_TOKEN_BALANCE_SUCCESS
} from '../ActionTypes/DashboardActionTypes'

import {
    DECIMALS,
    MAX_VALUE,
    NULL_ADDRESS,
    SHARE_TYPE_LONG,
    SHARE_TYPE_SHORT
} from '../../../../Base/Constants'

const {
    BigNumber
} = require('0x.js')

const {
    assetDataUtils,
    orderHashUtils,
    signatureUtils,
    generatePseudoRandomSalt,
    OrderValidationUtils
} = require('@0x/order-utils')

const {
    config,
    bettingExchange,
    erc20Proxy,
    exchange,
    market,
    token,
    web3
} = require('../../../../Contracts')

const {
    Web3Wrapper
} = require('@0x/web3-wrapper')

const {TransactionEncoder} = require('@0x/contract-wrappers')
const {ExchangeContract} = require('@0x/abi-gen-wrappers')

const {
    providerEngine,
    contractWrappers
} = require('../../../../Contracts/provider-engine')

const {
    HttpClient
} = require('@0x/connect')

const httpClient = new HttpClient(config.relayerUrl)
const ipfs = require("nano-ipfs-store").at(config.ipfsUrl)

export const toggleBaseDialog = createAction(
    TOGGLE_BASE_DIALOG,
    ({open, title, message}) => ({open, title, message})
)

export const toggleApproveTokensDialog = createAction(
    TOGGLE_APPROVE_TOKENS_DIALOG
)
export const toggleCreateBettingMarketDialog = createAction(
    TOGGLE_CREATE_BETTING_MARKET_DIALOG
)
export const toggleFillOrderDialog = createAction(
    TOGGLE_FILL_ORDER_DIALOG,
    ({marketId, order, type, outcome}) => ({marketId, order, type, outcome})
)
export const setBettingMarketName = createAction(SET_BETTING_MARKET_NAME, name => name)
export const setBettingMarketDescription = createAction(SET_BETTING_MARKET_DESCRIPTION, description => description)
export const setBettingMarketCategory = createAction(SET_BETTING_MARKET_CATEGORY, category => category)
export const setMarketOutcomeName = createAction(SET_MARKET_OUTCOME_NAME, name => name)

export const addMarketOutcome = createAction(ADD_MARKET_OUTCOME)
export const removeMarketOutcome = createAction(REMOVE_MARKET_OUTCOME)
export const updateMarketTimes = createAction(UPDATE_MARKET_TIMES, times => times)

export const toggleDrawer = createAction(TOGGLE_DRAWER)
export const setDrawer = createAction(SET_DRAWER, open => open)
export const closeDrawer = createAction(CLOSE_DRAWER)

export const setPlaceOrderPrice = createAction(
    SET_PLACE_ORDER_PRICE,
    ({type, value}) => ({type, value})
)

export const setPlaceOrderQuantity = createAction(
    SET_PLACE_ORDER_QUANTITY,
    ({type, value}) => ({type, value})
)

export const getTokenBalance = () => {
    return async dispatch => {
        dispatch({type: GET_TOKEN_BALANCE_LOADING})
        try {
            const balance = await token.balanceOf(config.address)

            return dispatch({
                type: GET_TOKEN_BALANCE_SUCCESS,
                payload: balance
            })
        } catch (e) {
            return dispatch({
                type: GET_TOKEN_BALANCE_ERROR,
                error: e
            })
        }
    }
}

export const getTradeAllowances = () => {
    return async dispatch => {
        dispatch({type: GET_TRADE_ALLOWANCES_LOADING})
        try {
            const erc20ProxyAllowance = await token.allowance(
                config.address,
                erc20Proxy.address
            )

            const bettingExchangeAllowance = await token.allowance(
                config.address,
                bettingExchange.address
            )

            return dispatch({
                type: GET_TRADE_ALLOWANCES_SUCCESS,
                payload: {
                    erc20ProxyAllowance,
                    bettingExchangeAllowance
                }
            })
        } catch (e) {
            return dispatch({
                type: GET_TRADE_ALLOWANCES_ERROR,
                error: e
            })
        }
    }
}

export const approveTokensForTrading = () => {
    return async dispatch => {
        dispatch({type: APPROVE_TOKENS_LOADING})
        try {
            await token.approve(
                erc20Proxy.address,
                MAX_VALUE
            )

            await token.approve(
                bettingExchange.address,
                MAX_VALUE
            )

            return dispatch({
                type: APPROVE_TOKENS_SUCCESS,
                payload: true
            })
        } catch (e) {
            return dispatch({
                type: APPROVE_TOKENS_ERROR,
                error: e
            })
        }
    }
}

export const createBettingMarket = (name,
                                    description,
                                    resolutionSource,
                                    category,
                                    eventStart,
                                    marketOpen,
                                    marketClose,
                                    outcomes) => {
    return async dispatch => {
        dispatch({type: CREATE_BETTING_MARKET_LOADING})
        try {
            const marketType = 1
            const bytes32Outcomes = outcomes.map(outcome => web3.utils.fromUtf8(outcome))
            const minBet = web3.utils.toWei('1', 'ether')
            const maxBet = web3.utils.toWei('1000000', 'ether')

            const ipfsHash = await ipfs.add(JSON.stringify({
                name,
                description,
                resolutionSource
            }))
            console.log(await ipfs.cat(ipfsHash))

            eventStart = new BigNumber(eventStart).dividedBy(1000)
            marketOpen = new BigNumber(marketOpen).dividedBy(1000)
            marketClose = new BigNumber(marketClose).dividedBy(1000)

            const tx = await market.createBettingMarket(
                marketType,
                category,
                eventStart.toFixed(0),
                marketOpen.toFixed(0),
                marketClose.toFixed(0),
                bytes32Outcomes,
                minBet,
                maxBet,
                ipfsHash
            )
            console.log('createBettingMarket', tx)

            return dispatch({
                type: CREATE_BETTING_MARKET_SUCCESS,
                payload: true
            })
        } catch (e) {
            return dispatch({
                type: CREATE_BETTING_MARKET_ERROR,
                error: e
            })
        }
    }
}

export const loadAvailableMarkets = () => {
    return async dispatch => {
        dispatch({type: LOAD_AVAILABLE_MARKETS_LOADING})
        try {
            const events = await market.logPastNewMarketEvents(
                0,
                'latest'
            )
            let eventDetails = []

            const getMarketDetails = async id => {
                let info = await market.getMarket(id)
                let details = await ipfs.cat(info.ipfsHash)
                details = JSON.parse(details)

                let outcomes = []
                let marketOutcomeCount = await market.getMarketOutcomeCount(id)
                for (let i = 0; i < marketOutcomeCount; i++)
                    outcomes.push(web3.utils.toUtf8(await market.getMarketOutcomeAtIndex(id, i)))

                return {
                    id,
                    info,
                    details,
                    outcomes
                }
            }


            events.map(event => {
                const {id} = event.returnValues
                eventDetails.push(getMarketDetails(id))
            })

            eventDetails = await Promise.all(eventDetails)

            return dispatch({
                type: LOAD_AVAILABLE_MARKETS_SUCCESS,
                payload: eventDetails
            })
        } catch (e) {
            return dispatch({
                type: LOAD_AVAILABLE_MARKETS_ERROR,
                error: e
            })
        }
    }
}

export const getOutcomeShareTokenOrderbook = (id,
                                              outcome) => {
    return async dispatch => {
        dispatch({type: GET_OUTCOME_SHARE_TOKEN_ORDER_BOOK_LOADING})
        try {
            console.log('getOutcomeShareTokenOrderbook', id, outcome)
            const outcomeBytes = web3.utils.fromUtf8(outcome)

            const dbetAssetData =
                assetDataUtils.encodeERC20AssetData(token.address)

            const getOutcomeShareTokenOrderbook = async shareType => {
                const outcomeTokenName = await market.getMarketOutcomeShareTokenName(
                    id,
                    outcomeBytes,
                    shareType
                )

                const outcomeTokenAddress = await market.getMarketOutcomeShareToken(
                    id,
                    outcomeTokenName
                )

                const takerAssetData = assetDataUtils.encodeERC20AssetData(outcomeTokenAddress)

                const orderbookRequest = {
                    // long = maker -> DBET, taker -> outcome long token
                    baseAssetData: dbetAssetData,
                    // short = maker -> DBET, taker -> outcome short token
                    quoteAssetData: takerAssetData
                }
                const orderbook = await httpClient.getOrderbookAsync(
                    orderbookRequest,
                    {networkId: config.networkId}
                )

                const getPrice = order => order.makerAssetAmount.dividedBy(order.takerAssetAmount)

                orderbook.bids.records.map((_order, index) =>
                    orderbook.bids.records[index].order.orderHash = orderHashUtils.getOrderHashHex(_order.order)
                )
                orderbook.bids.records.sort((a, b) => {
                    if (getPrice(a.order).greaterThan(getPrice(b.order)))
                        return 1
                    else if (getPrice(b.order).greaterThan(getPrice(a.order)))
                        return -1
                    else
                        return 0
                })
                orderbook.asks.records.map((_order, index) =>
                    orderbook.asks.records[index].order.orderHash = orderHashUtils.getOrderHashHex(_order.order)
                )
                orderbook.asks.records.sort((a, b) => {
                    if (getPrice(a.order).greaterThan(getPrice(b.order)))
                        return -1
                    else if (getPrice(b.order).greaterThan(getPrice(a.order)))
                        return 1
                    else
                        return 0
                })
                return orderbook
            }

            const orderBook = {
                long: await getOutcomeShareTokenOrderbook(SHARE_TYPE_LONG),
                short: await getOutcomeShareTokenOrderbook(SHARE_TYPE_SHORT)
            }

            return dispatch({
                type: GET_OUTCOME_SHARE_TOKEN_ORDER_BOOK_SUCCESS,
                payload: {
                    orderBook,
                    outcome
                }
            })
        } catch (e) {
            return dispatch({
                type: GET_OUTCOME_SHARE_TOKEN_ORDER_BOOK_ERROR,
                error: e
            })
        }
    }
}

export const placeOrder = (
    marketId,
    outcome,
    shareType,
    dbetAmount,
    shareAmount
) => {
    return async dispatch => {
        dispatch({type: PLACE_ORDER_LOADING})
        try {
            try {
                const outcomeBytes = web3.utils.fromUtf8(outcome)

                const outcomeTokenName = await market.getMarketOutcomeShareTokenName(
                    marketId,
                    outcomeBytes,
                    shareType
                )

                const outcomeTokenAddress = await market.getMarketOutcomeShareToken(
                    marketId,
                    outcomeTokenName
                )

                // Maker asset = DBET, taker asset = Outcome longs
                const makerAssetData =
                    assetDataUtils.encodeERC20AssetData(token.address)

                // Outcome long tokens
                const takerAssetData =
                    assetDataUtils.encodeERC20AssetData(outcomeTokenAddress)

                console.log('Place order', {
                    dbetAmount,
                    shareAmount
                })

                const makerAssetAmount = Web3Wrapper.toBaseUnitAmount(dbetAmount, DECIMALS)
                const takerAssetAmount = Web3Wrapper.toBaseUnitAmount(shareAmount, DECIMALS)

                console.log('Place order', {
                    makerAssetAmount,
                    takerAssetAmount
                })

                const {
                    timestamp
                } = await web3.eth.getBlock('latest')

                const expiration = timestamp + 86400 // 1 day in the future

                const exchangeAddress = exchange.address.toLowerCase()
                const makerAddress = config.address.toLowerCase()

                const orderConfigRequest = {
                    exchangeAddress,
                    makerAddress: makerAddress,
                    takerAddress: NULL_ADDRESS,
                    expirationTimeSeconds: new BigNumber(expiration),
                    makerAssetAmount,
                    takerAssetAmount,
                    makerAssetData,
                    takerAssetData,
                }

                const orderConfig = await httpClient.getOrderConfigAsync(orderConfigRequest, {
                    networkId: config.networkId
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
                OrderValidationUtils._validateOrderNotExpiredOrThrow(signedOrder.expirationTimeSeconds)
                await contractWrappers.exchange.validateOrderFillableOrThrowAsync(signedOrder)

                // Submit the order to the SRA Endpoint
                await httpClient.submitOrderAsync(
                    signedOrder,
                    {networkId: config.networkId}
                )
                console.log(`Successfully submitted ${shareType} order to relayer`)
            } catch (e) {
                console.error('Error placing order', e.stack)
            }
            return dispatch({
                type: PLACE_ORDER_SUCCESS,
                payload: {}
            })
        } catch (e) {
            return dispatch({
                type: PLACE_ORDER_ERROR,
                error: e
            })
        }
    }
}

export const fillOrder = (
    marketId,
    order,
    outcome,
    isLong
) => {
    return async dispatch => {
        dispatch({type: FILL_ORDER_LOADING})
        try {
            console.log('Fill order', {
                marketId,
                order,
                outcome,
                isLong
            })
            let exchangeWrapper = new ExchangeContract(
                exchange.instance.options.jsonInterface,
                exchange.instance.options.address,
                web3.currentProvider,
                {}
            )

            let transactionEncoder = new TransactionEncoder(
                exchangeWrapper
            )

            const fillOrderData = exchangeWrapper.fillOrder.getABIEncodedTransactionData(
                order,
                order.takerAssetAmount,
                order.signature
            )
            const zeroExTxHash = transactionEncoder.getTransactionHex(
                fillOrderData,
                order.salt,
                web3.eth.accounts.wallet[0].address.toLowerCase()
            )
            const takerTxSignature = await signatureUtils.ecSignHashAsync(
                web3.currentProvider,
                zeroExTxHash,
                web3.eth.accounts.wallet[0].address.toLowerCase()
            )

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

            console.log('Sending fill order tx',
                {
                    marketId,
                    outcome: web3.utils.fromUtf8(outcome),
                    isLong,
                    order: convertOrderToTuple(order),
                    fillAmount: order.takerAssetAmount,
                    salt: web3.utils.toHex(order.salt),
                    makerSignature: order.signature,
                    takerTxSignature
                }
            )
            const tx =
                await bettingExchange.fillOrder(
                    marketId,
                    web3.utils.fromUtf8(outcome),
                    isLong,
                    convertOrderToTuple(order),
                    web3.utils.toHex(order.takerAssetAmount),
                    web3.utils.toHex(order.salt),
                    order.signature,
                    takerTxSignature
                )

            console.log(`Successfully filled order ${order.orderHash}.`)
            console.log('Tx hash =', tx.transactionHash)

            return dispatch({
                type: FILL_ORDER_SUCCESS,
                payload: {}
            })
        } catch (e) {
            return dispatch({
                type: FILL_ORDER_ERROR,
                error: e
            })
        }
    }
}