const Web3 = require('web3')

// Imports
const contracts = require('./utils/contracts')
const utils = require('./utils/utils')

let token,
    bettingExchange,
    market,
    // 0x contracts
    assetProxyOwner,
    erc20Proxy,
    exchange

let owner
let user1
let user2

const web3 = new Web3()

const timeTravel = async timeDiff => {
    await utils.timeTravel(timeDiff)
}

contract('Market', accounts => {
    it('initializes Market contract', async () => {
        owner = accounts[0]
        user1 = accounts[1]
        user2 = accounts[2]

        token = await contracts.DecentBetToken.deployed()
        bettingExchange = await contracts.BettingExchange.deployed()
        market = await contracts.Market.deployed()
        assetProxyOwner = await contracts.AssetProxyOwner.deployed()
        erc20Proxy = await contracts.ERC20Proxy.deployed()
        exchange = await contracts.Exchange.deployed()

        const marketToken = await market.token()

        assert.equal(
            token.address,
            marketToken
        )
    })

    it('throws if non-owners set betting exchange contract', async () => {
        await utils.assertFail(market.setBettingExchange(bettingExchange.address, {from: user1}))
    })

    it('allows owners to set betting exchange contract', async () => {
        await market.setBettingExchange(bettingExchange.address, {from: owner})
        const marketExchange = await market.exchange()
        assert.equal(
            bettingExchange.address,
            marketExchange
        )
    })

    it('throws if non-owners add an admin', async () => {
        await utils.assertFail(
            market.addAdmin(user2, {from: user1})
        )
    })

    it('allows owners to add admins', async () => {
        await market.addAdmin(user2, {from: owner})
        const isUser2Admin = await market.admins(user2)
        assert.equal(
            isUser2Admin,
            true
        )
    })

    it('throws if non-owners remove admins', async () => {
        await utils.assertFail(
            market.removeAdmin(user2, {from: user1})
        )
    })

    it('allows owners to remove admins', async () => {
        await market.removeAdmin(user2, {from: owner})

        const isUser2Admin = await market.admins(user2)

        assert.equal(
            isUser2Admin,
            false
        )
    })

    it('throws if non-admins create betting markets', async () => {
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

        await utils.assertFail(
            market.createBettingMarket(
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
                    from: user1
                }
            )
        )
    })

    it('throws if admins create betting markets with invalid data', async () => {
        const validParams = await utils.getValidCreateBettingMarketParams()
        const invalidParams = await utils.getInvalidCreateBettingMarketParams()

        Object.keys(validParams).forEach(async key => {
            // Deep clone valid params
            const params = JSON.parse(JSON.stringify(validParams))
            params[key] = invalidParams[key]
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
            } = params

            await utils.assertFail(
                market.createBettingMarket(
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
            )
        })
    })

    it('allows admins to create betting markets with valid data', async () => {
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

        const marketCountPreCreation = (await market.marketCount()).toNumber()

        await market.createBettingMarket(
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
        const marketCountPostCreation = (await market.marketCount()).toNumber()

        assert.equal(
            marketCountPreCreation + 1,
            marketCountPostCreation
        )
    })

})
