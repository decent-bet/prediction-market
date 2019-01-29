# Decent.bet Prediction Market CLI

cli version of Decent.bet's prediction markets allowing users to send transactions on a development ganache-cli chain.

## Requirements

* [Truffle](https://github.com/trufflesuite/truffle)
* [Ganache-cli](https://github.com/trufflesuite/ganache-cli)
* [Thor](https://github.com/vechain/thor)

## Setup

* Clone this repo 
* Run `npm i`
* Run setup instructions for `prediction-market/core` and `prediction-market/relayer`  
* Run `ganache-cli` with the following configuration

    ```
    ganache-cli --mnemonic <YOUR_MNEMONIC> -i 10 --l 8000000
    ```
  Note: Use the same mnemonic being used in `.env`. Contract owner and maker/taker addresses will be derived from this mnemonic.
    
* Run `./init-contracts.sh` in [Core](https://github.com/decent-bet/incubator-research/tree/prediction_market_impl/prediction-market/core) to deploy contracts to your ganache-cli instance and copy build files to `cli` and `relayer`
* Run the relayer server as per instructions in `prediction-market/relayer`

## Scripts

The prediction markets consist of 2 main contracts:

1. Betting Exchange
2. Market

Execution scripts have been added to reduce args that need to be passed to the available commands by making use of 
hardcoded args wherever necessary.

The following functionality can be run using scripts available in the cli:

### Approve and transfer DBETs

This script approves token transfers from the `ERC20Proxy` and `BettingExchange` contracts on behalf of maker/taker addresses.
Also, if either maker/taker doesn't have enough DBETs, it transfers DBETs to them from the owner address.

```
npm run approve-and-transfer-dbets
```

### Create betting market

This script creates a new betting market with default parameters

```
npm run create-market
```

This will echo the created market ID like below:

```
Successfully created betting market - Market ID: 0x62a3f7db052c87326094b078dc07b4e6728b5a1d676f04c4fbb0ff82b2916989
```

### Place order

This script places an order in the betting market. It requires the following arguments:

1. marketId - created market ID
2. outcome - outcome to place an order on. Either `teamA` or `teamB`

```
npm run place-order -- --marketId 0x62a3f7db052c87326094b078dc07b4e6728b5a1d676f04c4fbb0ff82b2916989 --outcome teamA
```

This will echo the following if successful:

```
Successfully submitted long order to relayer

Successfully submitted short order to relayer
```

### View order books

Order books for any market outcome can be viewed by running this script. It requires the following arguments:

1. marketId - created market ID
2. outcome - outcome to place an order on. Either `teamA` or `teamB`

```
npm run view-order-book -- --marketId 0x62a3f7db052c87326094b078dc07b4e6728b5a1d676f04c4fbb0ff82b2916989 --outcome teamA
```

This will echo order books in the following format if successful:

```
Retrieved order books:
======================
teamA longs
Bids:  []

Asks:  [ { metaData: {},
    order: 
     { salt: 59924763842678495328,
       exchangeAddress: '0x55db2fee8a2a039bca83b014cf0b455a31e77cda',
       makerAddress: '0x4e746763311e2721a2997727ad0aa4a3f7821615',
       takerAddress: '0x0000000000000000000000000000000000000000',
       expirationTimeSeconds: 1547502632,
       makerAssetAmount: 100000000000000000000,
       takerAssetAmount: 500000000000000000000,
       makerAssetData: '0xf47261b0000000000000000000000000d3fc4a0d7dcc39eed0eba4b63dc3393268202d93',
       takerAssetData: '0xf47261b00000000000000000000000001e117373f13a88babf90a086c8bc4dd4eeb2d485',
       senderAddress: '0x0000000000000000000000000000000000000000',
       feeRecipientAddress: '0x0000000000000000000000000000000000000000',
       makerFee: 0,
       takerFee: 0,
       signature: '0x1b6169562019d9f125b1dec13c52b1b0f01318719af6025f0d5621dc8412c365d21ea929767ffa9616af4eb2aa007fbc478440f92c3126c6834578d8f96795313003',
       orderHash: '0x3d949e8654f443301e0f4fa6330089eb424c5f5ca63117f9077d8829d8889106' } } ]

teamA shorts
Bids:  []

Asks:  [ { metaData: {},
    order: 
     { salt: 20570119589874309817,
       exchangeAddress: '0x55db2fee8a2a039bca83b014cf0b455a31e77cda',
       makerAddress: '0x4e746763311e2721a2997727ad0aa4a3f7821615',
       takerAddress: '0x0000000000000000000000000000000000000000',
       expirationTimeSeconds: 1547502632,
       makerAssetAmount: 100000000000000000000,
       takerAssetAmount: 400000000000000000000,
       makerAssetData: '0xf47261b0000000000000000000000000d3fc4a0d7dcc39eed0eba4b63dc3393268202d93',
       takerAssetData: '0xf47261b00000000000000000000000005539eb79ed0bd8958662d86b2329b60f53903b09',
       senderAddress: '0x0000000000000000000000000000000000000000',
       feeRecipientAddress: '0x0000000000000000000000000000000000000000',
       makerFee: 0,
       takerFee: 0,
       signature: '0x1bf4eacec5d2bd5f4dff1b7c2370078802fb6a084fbd20ffe07ad66385471cb24f4fbdf523a65f29119de51e78d925c5049c423f3d1d5e49848520c9aa7b555cb403',
       orderHash: '0x65caa87fc36197555db0748878f966582ef7f806affc73ccc3cef83cd06583d3' } } ]
```

### Fill order

Orders stored in the relayer can be filled by running this script. This script requires the following arguments:

1. marketId - created market ID
2. outcome - outcome to place an order on. Either `teamA` or `teamB`
3. orderHash - valid hash of order stored in relayer
4. shareType - whether you would like go long/short

```
npm run fill-order -- --marketId 0x62a3f7db052c87326094b078dc07b4e6728b5a1d676f04c4fbb0ff82b2916989 --outcome teamA --orderHash 0x3d949e8654f443301e0f4fa6330089eb424c5f5ca63117f9077d8829d8889106 --shareType long  
```

This would echo the following if successful:

```
Successfully filled order 0x3d949e8654f443301e0f4fa6330089eb424c5f5ca63117f9077d8829d8889106
Tx hash = 0x52eee5a7fa40c1e73e92ef345e029e60fa6910bfd1b07a09986ccbeb4dae0601
```

### Cancel order

Orders stored in the relayer can be cancelled by running this script. This script requires the following arguments:

1. marketId - created market ID
2. outcome - outcome to place an order on. Either `teamA` or `teamB`
3. orderHash - valid hash of order stored in relayer

### Resolve market

Markets can be resolved by passing a winning outcome by running this script. This script requires the following arguments:

1. marketId - created market ID
2. winningOutcome - Outcome that won (teamA/teamB)

```
npm run resolve-market -- --marketId 0x62a3f7db052c87326094b078dc07b4e6728b5a1d676f04c4fbb0ff82b2916989 --winningOutcome teamA
```

This would echo the following if successful:

```
Successfully resolve betting market - Market ID: 0x62a3f7db052c87326094b078dc07b4e6728b5a1d676f04c4fbb0ff82b2916989
```

### Claim favorable outcome share tokens

Favorable outcome share tokens can be redeemed for DBETs by running this script. This script requires the following arguments:

1. marketId - created market ID
2. isMaker - Is the maker address sending the transaction (true/false)

```
npm run claim-outcome-share-tokens -- --marketId 0x62a3f7db052c87326094b078dc07b4e6728b5a1d676f04c4fbb0ff82b2916989 --isMaker false
```

This would echo the following if successful:

```
Successfully claimed outcome share tokens for market: 0x62a3f7db052c87326094b078dc07b4e6728b5a1d676f04c4fbb0ff82b2916989
```