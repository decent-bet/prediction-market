const AssetProxyOwner = artifacts.require('AssetProxyOwner')
const BettingExchange = artifacts.require('BettingExchange')
const DecentBetToken = artifacts.require('DBETVETToken')
const ERC20Proxy = artifacts.require('ERC20Proxy')
const Exchange = artifacts.require('Exchange')
const Market = artifacts.require('Market')

const { assetDataUtils } = require('@0x/order-utils')
const utils = require('../../test/utils/utils')

let deploy = async (deployer, network) => {
    web3.eth.defaultAccount = process.env.DEFAULT_ACCOUNT

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

    const getContractInstanceAndInfo = async contract => {
        let instance = await contract.deployed()
        contractInfo[contract.contractName] = await utils.getGasUsage(
            contract,
            deployer.network_id
        )
        return instance
    }

    console.log('Deploying with network', network)

    if (network === 'rinkeby' || network === 'development') {
        try {
            // Deploy the DecentBetToken contract
            await deployer.deploy(
                DecentBetToken,
                TOKEN_NAME,
                TOKEN_SYMBOL,
                TOKEN_DECIMALS,
                TOTAL_DBET_SUPPLY
            )
            token = await getContractInstanceAndInfo(DecentBetToken)

            // Deploy the 0x ERC20 proxy contract
            await deployer.deploy(
                ERC20Proxy
            )
            erc20Proxy = await getContractInstanceAndInfo(ERC20Proxy)

            // Deploy the 0x AssetProxyOwner contract
            const confirmationsRequired = 1
            const secondsLocked = 0

            await deployer.deploy(
                AssetProxyOwner,
                [web3.eth.defaultAccount],
                [erc20Proxy.address],
                confirmationsRequired,
                secondsLocked
            )
            assetProxyOwner = await getContractInstanceAndInfo(AssetProxyOwner)

            const dbetAssetData = assetDataUtils.encodeERC20AssetData(token.address)
            // Deploy the 0x exchange contract
            await deployer.deploy(
                Exchange,
                dbetAssetData
            )
            exchange = await getContractInstanceAndInfo(Exchange)

            // Deploy the DBET market contract
            await deployer.deploy(
                Market,
                token.address,
                erc20Proxy.address
            )
            market = await getContractInstanceAndInfo(Market)

            // Add Exchange as an authorized address in Erc20 proxy
            await erc20Proxy.addAuthorizedAddress(exchange.address)

            // Transfer ownership in Erc20Proxy to AssetProxyOwner
            await erc20Proxy.transferOwnership(assetProxyOwner.address)

            // Register AssetProxy to Exchange
            await exchange.registerAssetProxy(erc20Proxy.address)

            // Deploy the DBET betting exchange contract
            await deployer.deploy(
                BettingExchange,
                exchange.address,
                market.address
            )
            bettingExchange = await getContractInstanceAndInfo(BettingExchange)

            // Set betting exchange in the market contract
            await market.setBettingExchange(
                bettingExchange.address
            )

            console.log(
                'Deployed:',
                '\nToken: ' + token.address,
                '\nERC20Proxy: ' + erc20Proxy.address,
                '\nAssetProxyOwner: ' + assetProxyOwner.address,
                '\nExchange: ' + exchange.address,
                '\nMarket: ' + market.address,
                '\nBetting Exchange: ' + bettingExchange.address,
                '\n\nContract info:\n',
                contractInfo
            )
        } catch (e) {
            console.log('Error deploying contracts', e.message, e.stack)
        }
    } else if (network === 'mainnet') {
        try {

        } catch (e) {
            console.log('Error deploying contracts', e.message)
        }
    }
}

module.exports = function(deployer, network) {
    // Work-around to stage tasks in the migration script and not actually run them
    // https://github.com/trufflesuite/truffle/issues/501#issuecomment-332589663
    deployer.then(() => deploy(deployer, network))
}
