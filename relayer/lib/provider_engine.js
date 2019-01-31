"use strict";
exports.__esModule = true;
var _0x_js_1 = require("0x.js");
var subproviders_1 = require("@0x/subproviders");
var configs_1 = require("./configs");
exports.mnemonicWallet = new subproviders_1.MnemonicWalletSubprovider({
    mnemonic: configs_1.MNEMONIC,
    baseDerivationPath: configs_1.BASE_DERIVATION_PATH
});
exports.pe = new _0x_js_1.Web3ProviderEngine();
exports.pe.addProvider(exports.mnemonicWallet);
exports.pe.addProvider(new _0x_js_1.RPCSubprovider(configs_1.NETWORK_CONFIGS.rpcUrl));
exports.pe.start();
exports.providerEngine = exports.pe;
//# sourceMappingURL=provider_engine.js.map