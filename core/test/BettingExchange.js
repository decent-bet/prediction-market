const Web3 = require('web3')

// Imports
const contracts = require('./utils/contracts')
const utils = require('./utils/utils')

const {
    assetDataUtils,
    orderHashUtils,
    generatePseudoRandomSalt,
    signatureUtils
} = require('@0x/order-utils')
const { BigNumber } = require('@0x/utils')
const { TransactionEncoder } = require('@0x/contract-wrappers')
const { ExchangeContract } = require('@0x/abi-gen-wrappers')

let token,
    bettingExchange,
    market,
    // 0x contracts
    assetProxyOwner,
    erc20Proxy,
    exchange

let exchangeWrapper
let transactionEncoder

let owner
let maker
let taker
let marketId

const web3 = new Web3(new Web3.providers.WebsocketProvider('ws://localhost:8545'))
const MAX_ETH_VALUE = '115792089237316195423570985008687907853269984665640564039457584007913129639935'
const EMPTY_ADDRESS = '0x0000000000000000000000000000000000000000'
const INITIAL_USER_BALANCE = web3.utils.toWei('10000', 'ether')

const OUTCOME_A = web3.utils.fromUtf8('A')
const OUTCOME_B = web3.utils.fromUtf8('B')

const timeTravel = async timeDiff => {
    await utils.timeTravel(timeDiff)
}

const getValidFillOrderParams = async (
    outcome,
    isLong,
    makerAssetAmount,
    takerAssetAmount
) => {
    const type = isLong ? 'long' : 'short'

    const outcomeLongTokenName = await market.getMarketOutcomeShareTokenName(
        marketId,
        outcome,
        type
    )

    const outcomeLongTokenAddress = await market.getMarketOutcomeShareToken(
        marketId,
        outcomeLongTokenName
    )

    // DBETs
    const makerAssetData = assetDataUtils.encodeERC20AssetData(token.address)
    // Outcome long tokens
    const takerAssetData = assetDataUtils.encodeERC20AssetData(outcomeLongTokenAddress)

    const order = {
        makerAddress: maker.toLowerCase(),
        takerAddress: EMPTY_ADDRESS,
        feeRecipientAddress: EMPTY_ADDRESS,
        senderAddress: EMPTY_ADDRESS,
        // 10 DBETs
        makerAssetAmount: web3.utils.toWei(
            makerAssetAmount ? makerAssetAmount : '10',
            'ether'
        ),
        // 100 outcome long tokens
        takerAssetAmount: web3.utils.toWei(
            takerAssetAmount ? takerAssetAmount : '100',
            'ether'
        ),
        makerFee: '0',
        takerFee: '0',
        expirationTimeSeconds: (new Date().getTime() + 864000).toString(),
        salt: generatePseudoRandomSalt().toString().slice(0, 20),
        exchangeAddress: (exchange.address).toLowerCase(),
        makerAssetData,
        takerAssetData
    }

    const orderHash = orderHashUtils.getOrderHashHex(order)

    const makerOrderSignature = await signatureUtils.ecSignHashAsync(
        web3.currentProvider,
        orderHash,
        maker
    )

    const takerOrderSignature = await signatureUtils.ecSignHashAsync(
        web3.currentProvider,
        orderHash,
        taker
    )
    const signedOrder = {
        ...order,
        signature: makerOrderSignature
    }

    const fillOrderData = exchangeWrapper.fillOrder.getABIEncodedTransactionData(
        order,
        order.takerAssetAmount,
        makerOrderSignature
    )
    const zeroExTxHash = transactionEncoder.getTransactionHex(
        fillOrderData,
        order.salt,
        taker.toLowerCase()
    )

    const takerTxSignature = await signatureUtils.ecSignHashAsync(
        web3.currentProvider,
        zeroExTxHash,
        taker
    )

    return {
        outcome,
        isLong,
        order,
        signedOrder,
        orderHash,
        makerOrderSignature,
        takerOrderSignature,
        takerTxSignature
    }
}

const getTokenBalances = async () => {
    const outcome = 'A'

    // Convert to bytes32
    const _outcome = web3.utils.fromUtf8(outcome)

    const outcomeLongTokenName = await market.getMarketOutcomeShareTokenName(
        marketId,
        _outcome,
        'long'
    )
    const outcomeLongTokenAddress = await market.getMarketOutcomeShareToken(
        marketId,
        outcomeLongTokenName
    )

    const outcomeShortTokenName = await market.getMarketOutcomeShareTokenName(
        marketId,
        _outcome,
        'short'
    )
    const outcomeShortTokenAddress = await market.getMarketOutcomeShareToken(
        marketId,
        outcomeShortTokenName
    )

    const makerDbetBalance = web3.utils.fromWei(
        (await token.balanceOf(maker)).toString(),
        'ether'
    )
    const takerDbetBalance = web3.utils.fromWei(
        (await token.balanceOf(taker)).toString(),
        'ether'
    )

    const exchangeDbetBalance = web3.utils.fromWei(
        (await token.balanceOf(bettingExchange.address)).toString(),
        'ether'
    )

    const makerOutcomeLongTokenBalance = web3.utils.fromWei(
        (await bettingExchange.getOutcomeShareTokenBalanceOf(
            outcomeLongTokenAddress,
            maker
        )).toString(),
        'ether'
    )

    const takerOutcomeLongTokenBalance = web3.utils.fromWei(
        (await bettingExchange.getOutcomeShareTokenBalanceOf(
            outcomeLongTokenAddress,
            taker
        )).toString(),
        'ether'
    )

    const makerOutcomeShortTokenBalance = web3.utils.fromWei(
        (await bettingExchange.getOutcomeShareTokenBalanceOf(
            outcomeShortTokenAddress,
            maker
        )).toString(),
        'ether'
    )

    const takerOutcomeShortTokenBalance = web3.utils.fromWei(
        (await bettingExchange.getOutcomeShareTokenBalanceOf(
            outcomeShortTokenAddress,
            taker
        )).toString(),
        'ether'
    )

    return {
        makerDbetBalance,
        takerDbetBalance,
        exchangeDbetBalance,
        makerOutcomeLongTokenBalance,
        takerOutcomeLongTokenBalance,
        makerOutcomeShortTokenBalance,
        takerOutcomeShortTokenBalance
    }
}

const convertOrderToTuple = order => {
    const tuple = []
    Object.keys(order).forEach(key => {
        // Since exchangeAddress doesn't exist in contracts
        if(key !== 'exchangeAddress' && key !== 'signature')
            tuple.push(order[key])
    })
    return tuple
}

const transferInitialTokenBalance = async user => {
    const userBalance = await token.balanceOf(user)
    if(new BigNumber(userBalance).lessThan(INITIAL_USER_BALANCE)) {
        await token.transfer(user, INITIAL_USER_BALANCE, {
            from: owner
        })
    }
}

contract('BettingExchange', accounts => {
    it('initializes BettingExchange contract', async () => {
        owner = accounts[0]
        maker = accounts[1]
        taker = accounts[2]

        token = await contracts.DecentBetToken.deployed()
        bettingExchange = await contracts.BettingExchange.deployed()
        market = await contracts.Market.deployed()
        assetProxyOwner = await contracts.AssetProxyOwner.deployed()
        erc20Proxy = await contracts.ERC20Proxy.deployed()
        exchange = await contracts.Exchange.deployed()

        exchangeWrapper = new ExchangeContract(
            exchange.abi,
            exchange.address,
            web3.currentProvider,
            {}
        )

        transactionEncoder = new TransactionEncoder(
            exchangeWrapper
        )
    })

    it('throws if orders to be filled are from invalid markets', async () => {
        const {
            marketType,
            categoryId,
            eventStart,
            marketOpen,
            marketClose,
            outcomes,
            minBet,
            maxBet,
            ipfsHash,
        } = await utils.getValidCreateBettingMarketParams()

        const tx = await market.createBettingMarket(
            marketType,
            categoryId,
            eventStart,
            marketOpen,
            marketClose,
            outcomes,
            minBet,
            maxBet,
            ipfsHash,
            {
                from: owner
            }
        )

        marketId = tx.logs[0].args.marketId

        const {
            outcome,
            order,
        } = await getValidFillOrderParams(
            OUTCOME_A,
            true
        )

        // Approve proxy to transfer DBETs for maker
        await token.approve(
            erc20Proxy.address,
            MAX_ETH_VALUE,
            {
                from: maker
            }
        )

        // Approve betting exchange to transfer DBETs for maker
        await token.approve(
            bettingExchange.address,
            MAX_ETH_VALUE,
            {
                from: maker
            }
        )

        // Approve proxy to transfer DBETs for taker
        await token.approve(
            erc20Proxy.address,
            MAX_ETH_VALUE,
            {
                from: taker
            }
        )

        // Approve betting exchange to transfer DBETs for taker
        await token.approve(
            bettingExchange.address,
            MAX_ETH_VALUE,
            {
                from: taker
            }
        )

        // Transfers initial balances to maker and taker
        await transferInitialTokenBalance(maker)
        await transferInitialTokenBalance(taker)

        const invalidMarketId = web3.utils.fromUtf8('invalid')

        console.log('assertValidFillOrderParams')
        await utils.assertFail(bettingExchange.assertValidFillOrderParams(
            invalidMarketId,
            outcome,
            convertOrderToTuple(order),
            order.takerAssetAmount,
            {
                from: owner
            }
        ))
    })

    it('throws if orders to be filled has a zero takerAssetFillAmount', async () => {
        const {
            outcome,
            order,
        } = await getValidFillOrderParams(
            OUTCOME_A,
            true
        )
        order.takerAssetAmount = 0

        await utils.assertFail(bettingExchange.assertValidFillOrderParams(
            marketId,
            outcome,
            convertOrderToTuple(order),
            0,
            {
                from: owner
            }
        ))
    })

    it('throws if orders to be filled have invalid outcomes', async () => {
        const {
            order,
        } = await getValidFillOrderParams(
            OUTCOME_A,
            true
        )

        const outcome = web3.utils.fromUtf8('C')

        await utils.assertFail(bettingExchange.assertValidFillOrderParams(
            marketId,
            outcome,
            convertOrderToTuple(order),
            order.takerAssetAmount,
            {
                from: owner
            }
        ))
    })

    it('throws if orders to be filled have maker asset token addresses other than the DBET token', async () => {
        const {
            outcome,
            order,
        } = await getValidFillOrderParams(
            OUTCOME_A,
            true
        )

        order.makerAssetData = EMPTY_ADDRESS

        await utils.assertFail(bettingExchange.assertValidFillOrderParams(
            marketId,
            outcome,
            convertOrderToTuple(order),
            order.takerAssetAmount,
            {
                from: owner
            }
        ))
    })

    it('throws if maker of order to be filled has a balance lesser than maker asset amount', async () => {
        const {
            outcome,
            order,
        } = await getValidFillOrderParams(
            OUTCOME_A,
            true
        )

        order.makerAssetAmount = web3.utils.toWei('100000', 'ether')

        await utils.assertFail(bettingExchange.assertValidFillOrderParams(
            marketId,
            outcome,
            convertOrderToTuple(order),
            order.takerAssetAmount,
            {
                from: owner
            }
        ))
    })

    it('doesn\'t throw if passed parameters are valid', async () => {
        const {
            outcome,
            order,
        } = await getValidFillOrderParams(
            OUTCOME_A,
            true
        )

        const isValid = await bettingExchange.assertValidFillOrderParams(
            marketId,
            outcome,
            convertOrderToTuple(order),
            order.takerAssetAmount,
            {
                from: taker
            }
        )

        assert.equal(isValid, true)
    })

    it('fills order if passed parameters are valid', async () => {
        const {
            isLong,
            outcome,
            order,
            makerOrderSignature,
            takerTxSignature
        } = await getValidFillOrderParams(
            OUTCOME_A,
            true
        )

        await bettingExchange.fillOrder(
            marketId,
            outcome,
            isLong,
            convertOrderToTuple(order),
            order.takerAssetAmount,
            order.salt,
            makerOrderSignature,
            takerTxSignature,
            {
                from: taker
            }
        )
        const postFillBalances = await getTokenBalances()

        assert.equal(
            postFillBalances.makerOutcomeLongTokenBalance,
            '100'
        )

        assert.equal(
            postFillBalances.takerOutcomeShortTokenBalance,
            '100'
        )

        assert.equal(
            postFillBalances.exchangeDbetBalance,
            '100'
        )
    })

    it('batch fills orders if passed parameters are valid', async () => {
        const fillOrder1Params = await getValidFillOrderParams(
            OUTCOME_A,
            true,
            '20',
            '200'
        )
        const fillOrder2Params = await getValidFillOrderParams(
            OUTCOME_A,
            true,
            '30',
            '300'
        )

        console.log('Batch fill orders', fillOrder1Params)

        const takerTokenAllowance = await token.allowance(
            taker,
            bettingExchange.address
        )
        console.log(
            'Taker token allowance',
            web3.utils.fromWei(
                takerTokenAllowance.toString(),
                'ether'
            )
        )

        const preFillBalances = await getTokenBalances()
        console.log({preFillBalances})

        const tx = await bettingExchange.batchFillOrders(
            marketId,
            OUTCOME_A,
            true,
            [
                convertOrderToTuple(fillOrder1Params.order),
                convertOrderToTuple(fillOrder2Params.order)
            ],
            [
                fillOrder1Params.order.takerAssetAmount,
                fillOrder2Params.order.takerAssetAmount
            ],
            [
                fillOrder1Params.order.salt,
                fillOrder2Params.order.salt
            ],
            [
                fillOrder1Params.makerOrderSignature,
                fillOrder2Params.makerOrderSignature
            ],
            [
                fillOrder1Params.takerTxSignature,
                fillOrder2Params.takerTxSignature
            ],
            {
                from: taker
            }
        )

        const postFillBalances = await getTokenBalances()
        console.log({postFillBalances})

        assert.equal(
            postFillBalances.makerOutcomeLongTokenBalance,
            '600'
        )

        assert.equal(
            postFillBalances.takerOutcomeShortTokenBalance,
            '600'
        )

        assert.equal(
            postFillBalances.exchangeDbetBalance,
            '600'
        )
    })

    it('throws if resolve market is sent before market close by admins', async () => {
        await utils.assertFail(market.resolveMarket(
            marketId,
            OUTCOME_A,
            {
                from: owner
            }
        ))
    })

    it('throws if orders to be filled have market closes in the past', async () => {
        // Travel 15m into the future
        await timeTravel(15 * 60)

        const {
            isLong,
            outcome,
            order,
            makerOrderSignature,
            takerTxSignature
        } = await getValidFillOrderParams(
            OUTCOME_A,
            true
        )

        await utils.assertFail(bettingExchange.fillOrder(
            marketId,
            outcome,
            isLong,
            convertOrderToTuple(order),
            order.takerAssetAmount,
            order.salt,
            makerOrderSignature,
            takerTxSignature,
            {
                from: taker
            }
        ))
    })

    it('throws if resolve market is called by non-admin', async () => {
        await utils.assertFail(market.resolveMarket(
            marketId,
            OUTCOME_A,
            {
                from: maker
            }
        ))
    })

    it('allows admins to call resolve market', async () => {
        await market.resolveMarket(
            marketId,
            OUTCOME_A,
            {
                from: owner
            }
        )
    })

    it('returns 0 favorable outcome share tokens for users with no favorable outcome share tokens', async () => {
        const totalTakerRedeemed = (await market.redeemFavorableOutcomeShares.call(
            marketId,
            {
                from: taker
            }
        )).toString()
        assert.equal(
            totalTakerRedeemed,
            '0'
        )
    })

    it('allows users with favorable outcome share tokens to redeem tokens', async () => {
        const preClaimBalances = await getTokenBalances()
        const totalMakerRedeemed = web3.utils.fromWei((await market.redeemFavorableOutcomeShares.call(
            marketId,
            {
                from: maker
            }
        )).toString(), 'ether')
        assert.equal(
            totalMakerRedeemed,
            '600'
        )
        await market.redeemFavorableOutcomeShares(
            marketId,
            {
                from: maker
            }
        )
        const postClaimBalances = await getTokenBalances()

        console.log({
            preClaimBalances,
            postClaimBalances
        })
    })

})
