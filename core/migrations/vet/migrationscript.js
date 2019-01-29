const appRoot = require('app-root-path')

const { assetDataUtils } = require('@0x/order-utils')

const constants = require(`${appRoot}/lib/constants`)

function MigrationScript(web3, contractManager, deployer, args) {
    let defaultAccount

    let token,
        bettingExchange,
        market,
        // 0x contracts
        assetProxyOwner,
        erc20Proxy,
        exchange

    const TOKEN_NAME = 'Decent.bet Token'
    const TOKEN_SYMBOL = 'DBET'
    const TOKEN_DECIMALS = 18
    const TOTAL_DBET_SUPPLY = '205903294831970956466297922'

    let contractInfo = {}

    const getAccounts = () => {
        return web3.eth.accounts.wallet
    }

    const getDefaultOptions = () => {
        return {
            from: defaultAccount,
            gas: 8000000
        }
    }

    // Migration script
    this.migrate = async (chain) => {
        const AssetProxyOwner = contractManager.getContract('AssetProxyOwner')
        const BettingExchange = contractManager.getContract('BettingExchange')
        const DecentBetToken = contractManager.getContract('DBETVETToken')
        const ERC20Proxy = contractManager.getContract('ERC20Proxy')
        const Exchange = contractManager.getContract('Exchange')
        const Market = contractManager.getContract('Market')

        let accounts = await getAccounts()
        defaultAccount = accounts[0].address
        console.log('Available accounts', accounts.length, defaultAccount)

        try {
            if(chain === constants.CHAIN_SOLO || chain === constants.CHAIN_TESTNET) {
                // Deploy the DecentBetToken contract
                token = await deployer.deploy(
                    DecentBetToken,
                    TOKEN_NAME,
                    TOKEN_SYMBOL,
                    TOKEN_DECIMALS,
                    TOTAL_DBET_SUPPLY,
                    getDefaultOptions()
                )
                console.log('Deployed token')

                // Deploy the 0x ERC20 proxy contract
                erc20Proxy = await deployer.deploy(
                    ERC20Proxy,
                    getDefaultOptions()
                )
                console.log('Deployed erc20Proxy')

                // Deploy the 0x AssetProxyOwner contract
                const confirmationsRequired = 1
                const secondsLocked = 0

                assetProxyOwner = await deployer.deploy(
                    AssetProxyOwner,
                    [defaultAccount],
                    [erc20Proxy.options.address],
                    confirmationsRequired,
                    secondsLocked,
                    getDefaultOptions()
                )
                console.log('Deployed assetProxyOwner')

                const dbetAssetData = assetDataUtils.encodeERC20AssetData(token.options.address)
                // Deploy the 0x exchange contract
                exchange = await deployer.deploy(
                    Exchange,
                    dbetAssetData,
                    getDefaultOptions()
                )
                console.log('Deployed exchange')

                // Deploy the DBET market contract
                market = await deployer.deploy(
                    Market,
                    token.options.address,
                    erc20Proxy.options.address,
                    getDefaultOptions()
                )
                console.log('Deployed market')

                // Add Exchange as an authorized address in Erc20 proxy
                await erc20Proxy
                    .methods
                    .addAuthorizedAddress(exchange.options.address)
                    .send(getDefaultOptions())
                console.log('addAuthorizedAddress')

                // Transfer ownership in Erc20Proxy to AssetProxyOwner
                await erc20Proxy
                    .methods
                    .transferOwnership(assetProxyOwner.options.address)
                    .send(getDefaultOptions())
                console.log('transferOwnership')

                // Register AssetProxy to Exchange
                await exchange
                    .methods
                    .registerAssetProxy(erc20Proxy.options.address)
                    .send(getDefaultOptions())
                console.log('registerAssetProxy')

                // Deploy the DBET betting exchange contract
                bettingExchange = await deployer.deploy(
                    BettingExchange,
                    exchange.options.address,
                    market.options.address,
                    getDefaultOptions()
                )
                console.log('Deployed bettingExchange')

                // Set betting exchange in the market contract
                await market
                    .methods
                    .setBettingExchange(
                        bettingExchange.options.address
                    )
                    .send(getDefaultOptions())
                console.log('setBettingExchange')

                console.log(
                    'Deployed:',
                    '\nToken: ' + token.options.address,
                    '\nERC20Proxy: ' + erc20Proxy.options.address,
                    '\nAssetProxyOwner: ' + assetProxyOwner.options.address,
                    '\nExchange: ' + exchange.options.address,
                    '\nMarket: ' + market.options.address,
                    '\nBetting Exchange: ' + bettingExchange.options.address,
                    '\n\nContract info:\n',
                    contractInfo
                )
            } else if (chain === constants.CHAIN_MAIN) {
            }
        } catch (e) {
            console.log('Error deploying contracts:', e.message, e.stack)
        }
    }
}

module.exports = (web3, dbet, deployer, args) => {
    return new MigrationScript(web3, dbet, deployer, args)
}
