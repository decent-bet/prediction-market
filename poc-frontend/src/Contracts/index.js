import ContractManager from './contractManager'
import AssetProxyOwner from './assetProxyOwner'
import BettingExchange from './bettingExchange'
import ERC20Proxy from './erc20Proxy'
import Exchange from './exchange'
import Market from './market'
import Token from './token'
import KeyHandler from '../Base/KeyHandler'

const Web3 = require('web3')
const { thorify } = require('thorify')
// export const web3 = thorify(new Web3(), 'https://thor.test.decent.bet')

const keyHandler = new KeyHandler()
const {
    privateKey,
    address
} = keyHandler.get()

export const config = {
    chain_tag: '0x27',
    networkId: 10,
    isGanache: true,
    rpcUrl: 'http://localhost:8545',
    ipfsUrl: 'https://ipfs.infura.io:5001',
    relayerUrl: 'http://localhost:4444/v2/',
    privateKey,
    address
}

export const web3 = new Web3(config.rpcUrl)
web3.eth.accounts.wallet.add(privateKey)

export const contractManager = new ContractManager(web3, config)
export const assetProxyOwner = new AssetProxyOwner(contractManager)
export const bettingExchange = new BettingExchange(contractManager)
export const erc20Proxy = new ERC20Proxy(contractManager)
export const exchange = new Exchange(contractManager)
export const market = new Market(contractManager)
export const token = new Token(contractManager)