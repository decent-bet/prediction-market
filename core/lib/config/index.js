const config = require('../../vet-config')
const argv = require('yargs').argv

const CHAIN_TESTNET = 'testnet'

function Config() {

    const getDefaultChain = () => {
        return argv.chain ? argv.chain : CHAIN_TESTNET
    }

    const _chain = getDefaultChain()
    this.chain = _chain

    if (!config.chains.hasOwnProperty(_chain))
        throw new Error(
            `Config for chain: ${_chain} not available - please add it to ./config.js`
        )

    // Returns the value for a provided config parameter
    this.getParam = param => {
        return config.chains[_chain].hasOwnProperty(param)
            ? config.chains[_chain][param]
            : this.getDefaultConfig()[param]
    }

    // Returns the default Thor config
    this.getDefaultConfig = () => {
        return {
            host: 'localhost',
            port: 8669,
            chain: getDefaultChain(),
            chain_tag: this.getParam('chain_tag'),
            gasPrice: '100000000000',
            from: null,
            privateKey: null
        }
    }

    // Returns the node URL for the current configuration
    this.getNodeUrl = () => {
        const host = this.getParam('host')
        const port = this.getParam('port')
        const isSecure = this.getParam('secure')

        let scheme = 'http'
        if (isSecure) {
            scheme = 'https'
        }

        if(port && port !== '')
            return `${scheme}://${host}:${port}`
        else
            return `${scheme}://${host}`
    }
}

module.exports = Config
