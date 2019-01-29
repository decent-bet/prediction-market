# Decent.bet 0x P2P order relayer

DBET relayer server for p2p orders based on the 0x [simple relayer server](https://github.com/0xProject/0x-starter-project/blob/master/src/sra_server.ts).
he relayer accepts signed orders POSTed to it for different market outcomes and allows users to retrieve long/short order books for
available market outcomes.

## Requirements

* [Ganache-cli](https://github.com/trufflesuite/ganache-cli)
* [Prediction market CLI](https://github.com/decent-bet/incubator-research/tree/prediction_market_impl/prediction-market/cli)
* [Prediction market core contracts](https://github.com/decent-bet/incubator-research/tree/prediction_market_impl/prediction-market/core)

## Setup

```
npm install
```

Before running the server, run the `init-contracts` script in `prediction-market cli` to copy the contract build files to the relayer dir.

To run,

```
npm run relayer_server
```

## Available endpoints

All endpoints need to be prefixed with `/v2` signifying v2 of the 0x protocol

### GET `/orderbook`

**Query Parameters:**

* baseAssetData - DBET token asset data
* quoteAssetData - Outcome share token asset data
* networkId - Network ID

Returns an order book for a provided market ID and outcome

### POST `/order_config`

**Query Parameters:**

* networkId - Network ID

Retrieves values for order fields that the relayer requires when an order is sent to it.

### POST `/order`

**Query Parameters:**

* networkId - Network ID

**Body:**

* signedOrder - Signed order consisting of the following order parameters

    * salt
    * makerAssetAmount
    * takerAssetAmount
    * makerFee
    * takerFee
    * expirationTimeSeconds