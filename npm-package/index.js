const PACKAGE_JSON = require("./package.json");

module.exports = {
  VERSION: PACKAGE_JSON.version,

  DBETVETTokenContract: {
    raw: require("./build/contracts/DBETVETTokenContract.json"),
    address: {
      "0x27": "0x510fCddC9424B1bBb328A574f45BfDdB130e1f03", // Testnet
      "0xc7": "0x1b8EC6C2A45ccA481Da6F243Df0d7A5744aFc1f8", // Mainnet
      "0x4a": "0x1b8EC6C2A45ccA481Da6F243Df0d7A5744aFc1f8", // Mainnet
      "0xa4": "0xB0C7E1834642D94051DEC8B6d311f886E3553DAf" // Solo
    }
  },
  ExchangeContract: {
    raw: require("./build/contracts/ExchangeContract.json"),
    address: {
      "0x27": "0x55db2feE8A2A039BCA83b014cf0b455a31E77Cda", // Testnet
      "0xc7": "0x55db2feE8A2A039BCA83b014cf0b455a31E77Cda", // Mainnet
      "0x4a": "0x55db2feE8A2A039BCA83b014cf0b455a31E77Cda", // Mainnet
      "0xa4": "0x52a694a3178ada5f66c7ADC9095969D970777e35" // Solo
    }
  },
  MarketContract: {
    raw: require("./build/contracts/MarketContract.json"),
    address: {
      "0x27": "0x9FD9EaEdCB8621FEc90EE7538B72cde0406396bc", // Testnet
      "0xc7": "0x9FD9EaEdCB8621FEc90EE7538B72cde0406396bc", // Mainnet
      "0x4a": "0x9FD9EaEdCB8621FEc90EE7538B72cde0406396bc", // Mainnet
      "0xa4": "0xaaa9020bBD2e535A71f46b6Eb6250b9e27e10ad9" // Solo
    }
  },
  BettingExchangeContract: {
    raw: require("./build/contracts/BettingExchangeContract.json"),
    address: {
      "0x27": "0x016796874EA2fDE06B70b6a85a3e2c46c6e74563", // Testnet
      "0xc7": "0x016796874EA2fDE06B70b6a85a3e2c46c6e74563", // Mainnet
      "0x4a": "0x016796874EA2fDE06B70b6a85a3e2c46c6e74563", // Mainnet
      "0xa4": "0xA64Dc8083AE0A67E72759655B10e2228073B2f92" // Solo
    }
  }
};
