# Test Stack: the Prediction Market

A thor image seeded with the prediction market contracts. This is designed to be run in a development machine as a `ganache-cli` replacement. Also includes an IPFS instance to test the Market information retrieval.

## TL;DR

1. Clone this repo
2. `docker-compose up`
3. Connect via `web3` and `thorify` to `localhost:8669`. Use the listed contract addresses below in your code.

## Contract Addresses

```
Deployed:
Token: 0x4822A2A2EEe92714fcd06669cA99DF9692F797D7
ERC20Proxy: 0x845389D0Be75b05D880654F087ca359b93DB0f90
AssetProxyOwner: 0x249C69BC7244226a2c256048826d7E4751185B65
Exchange: 0xaC4b4d4a785EbB74F2Eae4F7C7Dbbc6a19f37c7b
Market: 0x2889f67347ecf1536de6475fa0529248e8438157
Betting Exchange: 0xA2396C4598265Ee8F8066d4E9E1ccCCC552cd320
```

## Market Contract

Authorized admins:

- 0x7567d83b7b8d80addcb281a71d54fc7b3364ffed
- 0xd3ae78222beadb038203be21ed5ce7c9b1bff602
- 0x733b7269443c70de16bbf9b0615307884bcc5636
- 0x115eabb4f62973d0dba138ab7df5c0375ec87256
