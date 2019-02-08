# Test Stack: the Prediction Market

A thor image seeded with the prediction market contracts. This is designed to be run in a development machine as a `ganache-cli` replacement. Also includes an IPFS instance to test the Market information retrieval.

## TL;DR

1. Clone this repo
2. `docker-compose up`
3. Connect via `web3` and `thorify` to `localhost:8669`. Use the listed contract addresses below in your code.

## Contract Addresses

```
Deployed:
Token: 0xB0C7E1834642D94051DEC8B6d311f886E3553DAf
ERC20Proxy: 0x13E183e04c33aD35A4c86279a7837115268f4A4F
AssetProxyOwner: 0xd71Ca9537399c29C6784a51e5b5eBd5e0C9Bf248
Exchange: 0x52a694a3178ada5f66c7ADC9095969D970777e35
Market: 0xaaa9020bBD2e535A71f46b6Eb6250b9e27e10ad9
Betting Exchange: 0xA64Dc8083AE0A67E72759655B10e2228073B2f92
```

## Market Contract

Authorized admins:

- 0x7567d83b7b8d80addcb281a71d54fc7b3364ffed
- 0xd3ae78222beadb038203be21ed5ce7c9b1bff602
- 0x733b7269443c70de16bbf9b0615307884bcc5636
- 0x115eabb4f62973d0dba138ab7df5c0375ec87256
