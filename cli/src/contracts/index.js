const BettingExchange = require('../../build/BettingExchange')
const DBETVETToken = require('../../build/DBETVETToken')
const Exchange = require('../../build/Exchange')
const ERC20Proxy = require('../../build/ERC20Proxy')
const Market = require('../../build/Market')

const {
    GANACHE_NETWORK_ID
} = require('../utils/constants')

module.exports = (web3) => {

    const bettingExchange = new web3.eth.Contract(
        BettingExchange.abi,
        BettingExchange.networks[GANACHE_NETWORK_ID].address
    )
    const dbetVetToken = new web3.eth.Contract(
        DBETVETToken.abi,
        DBETVETToken.networks[GANACHE_NETWORK_ID].address
    )
    const exchange = new web3.eth.Contract(
        Exchange.abi,
        Exchange.networks[GANACHE_NETWORK_ID].address
    )
    const erc20Proxy = new web3.eth.Contract(
        ERC20Proxy.abi,
        ERC20Proxy.networks[GANACHE_NETWORK_ID].address
    )
    const market = new web3.eth.Contract(
        Market.abi,
        Market.networks[GANACHE_NETWORK_ID].address
    )

    return {
        bettingExchange,
        dbetVetToken,
        exchange,
        erc20Proxy,
        market
    }
}