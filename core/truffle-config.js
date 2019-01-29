require('dotenv').config()

const HDWalletProvider = require('truffle-hdwallet-provider')

const mnemonic = process.env.MNEMONIC
const network = process.env.NETWORK

const IS_DOCKER = process.env.NODE_ENV === 'docker'
const HOST = IS_DOCKER ? 'ganache-cli' : 'localhost'
const LOCAL_NODE_URL = 'http://' + HOST + ':8545'

console.log('Network url', LOCAL_NODE_URL, network)

const provider = new HDWalletProvider(mnemonic, LOCAL_NODE_URL)

console.log(
    `Deploying with mnemonic '${mnemonic}'`,
    'address',
    provider.addresses[0]
)

module.exports = {
    migrations_directory: './migrations',
    networks: {
        development: {
            host: HOST,
            port: 8545,
            network_id: '*', // Match any network id,
            from: provider.addresses[0],
            gas: '8000000',
            gasPrice: '100000000000'
        }
    },
    solc: {
        optimizer: {
            enabled: true,
            runs: 200
        }
    }
}
