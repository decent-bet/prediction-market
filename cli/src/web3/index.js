require('dotenv').config()

const {
    ContractWrappers
} = require('0x.js')

const {
    NETWORK_CONFIGS
} = require('./configs')

const Web3 = require('web3')
const HDWalletProvider = require('truffle-hdwallet-provider')
const { thorify } = require('thorify')
const { providerEngine } = require('./provider-engine')

const {
    getContractAddress
} = require('../utils/utils')

const LOCAL_NODE_URL = 'http://localhost:8545'

const provider = new HDWalletProvider(
    process.env.MNEMONIC,
    LOCAL_NODE_URL,
    0, // Default address index
    5  // Number of addresses to instantiate
)

const web3 = new Web3(LOCAL_NODE_URL)
// const web3 = thorify(
//     new Web3(provider),
//     'http://localhost:8669'
// )

provider.addresses.map(address => {
    web3.eth.accounts.wallet.add('0x' + provider.wallets[address]._privKey.toString('hex'))
})

const ownerAddress = web3.eth.accounts.wallet[0].address
const makerAddress = web3.eth.accounts.wallet[1].address
const takerAddress = web3.eth.accounts.wallet[2].address

const contractWrappers = new ContractWrappers(providerEngine, {
    networkId: NETWORK_CONFIGS.networkId,
    contractAddresses: {
        exchange: getContractAddress('Exchange'),
        erc20Proxy: getContractAddress('ERC20Proxy'),
        erc721Proxy: '0x1d7022f5b17d2f8b695918fb48fa1089c9f85401',
        zrxToken: getContractAddress('DBETVETToken'),
        etherToken: getContractAddress('DBETVETToken'),
        assetProxyOwner: getContractAddress('AssetProxyOwner'),
        forwarder: '0xb69e673309512a9d726f87304c6984054f87a93b',
        orderValidator: '0xe86bb98fcf9bff3512c74589b78fb168200cc546',
    }
})

module.exports = {
    web3,
    ownerAddress,
    makerAddress,
    takerAddress,
    contractWrappers
}