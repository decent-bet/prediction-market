const { GANACHE_NETWORK_ID } = require('../utils/constants')

const MNEMONIC = 'mimic soda meat inmate cup someone labor odor invest scout fat ketchup'
const BASE_DERIVATION_PATH = `44'/60'/0'/0`
const GANACHE_CONFIGS = {
    rpcUrl: 'http://127.0.0.1:8545',
    networkId: GANACHE_NETWORK_ID,
}
const NETWORK_CONFIGS = GANACHE_CONFIGS

module.exports = {
    MNEMONIC,
    BASE_DERIVATION_PATH,
    NETWORK_CONFIGS
}