const PACKAGE_JSON = require("./package.json");

module.exports = {
  VERSION: PACKAGE_JSON.version,

  DBETVETTokenContract: {
    raw: require("./build/contracts/DBETVETToken.json"),
    address: {
      "0x27": "0x510fCddC9424B1bBb328A574f45BfDdB130e1f03", // Testnet
      "0xc7": "0x1b8EC6C2A45ccA481Da6F243Df0d7A5744aFc1f8", // Mainnet
      "0x4a": "0x1b8EC6C2A45ccA481Da6F243Df0d7A5744aFc1f8", // Mainnet
      "0xa4": "0x4822A2A2EEe92714fcd06669cA99DF9692F797D7" // Solo
    }
  },
  ExchangeContract: {
    raw: require("./build/contracts/Exchange.json"),
    address: {
      "0x27": "0x55db2feE8A2A039BCA83b014cf0b455a31E77Cda", // Testnet
      "0xc7": "0x55db2feE8A2A039BCA83b014cf0b455a31E77Cda", // Mainnet
      "0x4a": "0x55db2feE8A2A039BCA83b014cf0b455a31E77Cda", // Mainnet
      "0xa4": "0xaC4b4d4a785EbB74F2Eae4F7C7Dbbc6a19f37c7b" // Solo
    }
  },
  MarketContract: {
    raw: require("./build/contracts/Market.json"),
    address: {
      "0x27": "0x9FD9EaEdCB8621FEc90EE7538B72cde0406396bc", // Testnet
      "0xc7": "0x9FD9EaEdCB8621FEc90EE7538B72cde0406396bc", // Mainnet
      "0x4a": "0x9FD9EaEdCB8621FEc90EE7538B72cde0406396bc", // Mainnet
      "0xa4": "0x2889f67347ecf1536de6475fa0529248e8438157" // Solo
    }
  },
  BettingExchangeContract: {
    raw: require("./build/contracts/BettingExchange.json"),
    address: {
      "0x27": "0x016796874EA2fDE06B70b6a85a3e2c46c6e74563", // Testnet
      "0xc7": "0x016796874EA2fDE06B70b6a85a3e2c46c6e74563", // Mainnet
      "0x4a": "0x016796874EA2fDE06B70b6a85a3e2c46c6e74563", // Mainnet
      "0xa4": "0xA2396C4598265Ee8F8066d4E9E1ccCCC552cd320" // Solo
    }
  }
};
