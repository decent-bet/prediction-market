const { RPCSubprovider, Web3ProviderEngine } = require('0x.js')
const { MnemonicWalletSubprovider } = require('@0x/subproviders')

const { BASE_DERIVATION_PATH, MNEMONIC, NETWORK_CONFIGS } = require('./configs')

const mnemonicWallet = new MnemonicWalletSubprovider({
    mnemonic: MNEMONIC,
    baseDerivationPath: BASE_DERIVATION_PATH,
})

const providerEngine = new Web3ProviderEngine()
providerEngine.addProvider(mnemonicWallet)
providerEngine.addProvider(new RPCSubprovider(NETWORK_CONFIGS.rpcUrl))
providerEngine.start()

module.exports = {
    mnemonicWallet,
    providerEngine
}