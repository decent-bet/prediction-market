const { RPCSubprovider, Web3ProviderEngine } = require('0x.js')
const { PrivateKeyWalletSubprovider } = require('@0x/subproviders')
const { ContractWrappers } = require('0x.js')

const {
    config,
    assetProxyOwner,
    erc20Proxy,
    exchange,
    token,
} = require('./index')

const {
    privateKey,
    rpcUrl
} = config

export const privateKeyWallet = new PrivateKeyWalletSubprovider(privateKey.replace('0x', ''))

export const providerEngine = new Web3ProviderEngine()
providerEngine.addProvider(privateKeyWallet)
providerEngine.addProvider(new RPCSubprovider(rpcUrl))
providerEngine.start()

export const contractWrappers = new ContractWrappers(providerEngine, {
    networkId: 10,
    contractAddresses: {
        exchange: exchange.address.toLowerCase(),
        erc20Proxy: erc20Proxy.address.toLowerCase(),
        erc721Proxy: '0x1d7022f5b17d2f8b695918fb48fa1089c9f85401', // Place holder address
        zrxToken: token.address.toLowerCase(),
        etherToken: token.address.toLowerCase(),
        assetProxyOwner: assetProxyOwner.address.toLowerCase(),
        forwarder: '0xb69e673309512a9d726f87304c6984054f87a93b', // Place holder address
        orderValidator: '0xe86bb98fcf9bff3512c74589b78fb168200cc546', // Place holder address,
        dutchAuction: '0xe86bb98fcf9bff3512c74589b78fb168200cc546'
    }
})