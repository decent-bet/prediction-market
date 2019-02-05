import {
    BigNumber,
    ContractWrappers,
    DecodedLogEvent,
    ExchangeCancelEventArgs,
    ExchangeEvents,
    ExchangeFillEventArgs,
    orderHashUtils,
    signatureUtils,
    SignedOrder,
    ContractAddresses,
} from '0x.js';

import { APIOrder, OrderbookResponse } from '@0x/connect';
import * as bodyParser from 'body-parser';
import * as express from 'express';

import { NETWORK_CONFIGS } from './configs';
import { NULL_ADDRESS, ZERO } from './constants';
import {
    mnemonicWallet,
    providerEngine
} from './provider_engine';

const cors = require('cors');

const HTTP_OK_STATUS = 200;
const HTTP_BAD_REQUEST_STATUS = 400;
const HTTP_PORT = 4444;

// Global state
const orders: SignedOrder[] = [];
const ordersByHash: { [hash: string]: SignedOrder } = {};

// Returns the contract address deployed on the connected network for a given contract name
function getContractAddress(name: string): string {
    return require(`../build/contracts/${name}.json`).chain_tags['0x4a'].address.toLowerCase();
}

// Hardcoded Contract Addresses for the Thor Snapshot.
// Just change `contractAddressesForTestnet` with `contractAddressesForDemo` in `contractWrappers` to use
const contractAddressesForDemo: ContractAddresses = {
    exchange: '0x52a694a3178ada5f66c7ADC9095969D970777e35'.toLocaleLowerCase(),
    erc20Proxy: '0x13E183e04c33aD35A4c86279a7837115268f4A4F'.toLocaleLowerCase(),
    erc721Proxy: '0x1d7022f5b17d2f8b695918fb48fa1089c9f85401',
    zrxToken: '0xB0C7E1834642D94051DEC8B6d311f886E3553DAf'.toLocaleLowerCase(),
    etherToken: '0xB0C7E1834642D94051DEC8B6d311f886E3553DAf'.toLocaleLowerCase(),
    assetProxyOwner: '0xd71Ca9537399c29C6784a51e5b5eBd5e0C9Bf248'.toLocaleLowerCase(),
    forwarder: '0xb69e673309512a9d726f87304c6984054f87a93b',
    orderValidator: '0xe86bb98fcf9bff3512c74589b78fb168200cc546',
    dutchAuction: '0x0',
};
const contractAddressesForTestnet: ContractAddresses = {
    exchange: getContractAddress('Exchange'),
    erc20Proxy: getContractAddress('ERC20Proxy'),
    erc721Proxy: '0x1d7022f5b17d2f8b695918fb48fa1089c9f85401',
    zrxToken: getContractAddress('DBETVETToken'),
    etherToken: getContractAddress('DBETVETToken'),
    assetProxyOwner: getContractAddress('AssetProxyOwner'),
    forwarder: '0xb69e673309512a9d726f87304c6984054f87a93b',
    orderValidator: '0xe86bb98fcf9bff3512c74589b78fb168200cc546',
    dutchAuction: '0x0',
};

// Build the Contract Wrappers
const contractWrappers = new ContractWrappers(providerEngine, {
    networkId: NETWORK_CONFIGS.networkId,
    contractAddresses: contractAddressesForTestnet,
});

// We subscribe to the Exchange Events to remove any filled or cancelled orders
contractWrappers.exchange.subscribe(
    ExchangeEvents.Fill,
    {},
    (err: null | Error, decodedLogEvent?: DecodedLogEvent<ExchangeFillEventArgs>) => {
        if (err) {
            console.log('error:', err);
        } else if (decodedLogEvent) {
            const fillLog = decodedLogEvent.log;
            const orderHash = fillLog.args.orderHash;
            console.log(`Order filled ${fillLog.args.orderHash}`);
            removeOrder(orderHash);
        }
    },
);
// Listen for Cancel Exchange Events and remove any orders
contractWrappers.exchange.subscribe(
    ExchangeEvents.Cancel,
    {},
    (err: null | Error, decodedLogEvent?: DecodedLogEvent<ExchangeCancelEventArgs>) => {
        if (err) {
            console.log('error:', err);
        } else if (decodedLogEvent) {
            const fillLog = decodedLogEvent.log;
            const orderHash = fillLog.args.orderHash;
            console.log(`Order cancelled ${fillLog.args.orderHash}`);
            removeOrder(orderHash);
        }
    },
);

// HTTP Server
const app = express();
app.use(bodyParser.json());
app.use(cors());
/**
 * GET Orderbook endpoint retrieves the orderbook for a given asset pair.
 * http://sra-spec.s3-website-us-east-1.amazonaws.com/#operation/getOrderbook
 */
app.get('/v2/orderbook', (req, res) => {
    console.log('HTTP: GET orderbook');
    const baseAssetData = req.query.baseAssetData;
    const quoteAssetData = req.query.quoteAssetData;
    const networkIdRaw = req.query.networkId;
    // tslint:disable-next-line:custom-no-magic-numbers
    const networkId = parseInt(networkIdRaw, 10);
    if (networkId !== NETWORK_CONFIGS.networkId) {
        console.log(`Incorrect Network ID: ${networkId}`);
        res.status(HTTP_BAD_REQUEST_STATUS).send({});
    } else {
        const orderbookResponse = renderOrderbookResponse(baseAssetData, quoteAssetData);
        res.status(HTTP_OK_STATUS).send(orderbookResponse);
    }
});
/**
 * POST Order config endpoint retrives the values for order fields that the relayer requires.
 * http://sra-spec.s3-website-us-east-1.amazonaws.com/#operation/getOrderConfig
 */
app.post('/v2/order_config', (req, res) => {
    console.log('HTTP: POST order config');
    const networkIdRaw = req.query.networkId;
    // tslint:disable-next-line:custom-no-magic-numbers
    const networkId = parseInt(networkIdRaw, 10);
    if (networkId !== NETWORK_CONFIGS.networkId) {
        console.log(`Incorrect Network ID: ${networkId}`);
        res.status(HTTP_BAD_REQUEST_STATUS).send({});
    } else {
        const orderConfigResponse = {
            senderAddress: NULL_ADDRESS,
            feeRecipientAddress: NULL_ADDRESS,
            makerFee: ZERO,
            takerFee: ZERO,
        };
        res.status(HTTP_OK_STATUS).send(orderConfigResponse);
    }
});
/**
 * POST Order endpoint submits an order to the Relayer.
 * http://sra-spec.s3-website-us-east-1.amazonaws.com/#operation/postOrder
 */
app.post('/v2/order', (req, res) => {
    console.log('HTTP: POST order');
    const networkIdRaw = req.query.networkId;
    // tslint:disable-next-line:custom-no-magic-numbers
    const networkId = parseInt(networkIdRaw, 10);
    if (networkId !== NETWORK_CONFIGS.networkId) {
        console.log(`Incorrect Network ID: ${networkId}`);
        res.status(HTTP_BAD_REQUEST_STATUS).send({});
    } else {
        const signedOrder = parseHTTPOrder(req.body);
        const orderHash = orderHashUtils.getOrderHashHex(signedOrder);
        ordersByHash[orderHash] = signedOrder;
        orders.push(signedOrder);
        res.status(HTTP_OK_STATUS).send({});
    }
});
/**
 * POST Sign order endpoint.
 * Used to obtain a relayer signature necessary to submit orders to betting exchange
 */
app.post('/v2/order/sign', async (req, res) => {
    console.log('HTTP: POST order');
    const networkIdRaw = req.query.networkId;
    // tslint:disable-next-line:custom-no-magic-numbers
    const networkId = parseInt(networkIdRaw, 10);
    if (networkId !== NETWORK_CONFIGS.networkId) {
        console.log(`Incorrect Network ID: ${networkId}`);
        res.status(HTTP_BAD_REQUEST_STATUS).send({});
    } else {
        const orderHash = req.body.orderHash
        if(!ordersByHash[orderHash]) {
            console.log(`Invalid order hash: ${orderHash}`);
            res.status(HTTP_BAD_REQUEST_STATUS).send({});
        } else {
            const accounts = await mnemonicWallet.getAccountsAsync(1);
            const signature = await signatureUtils.ecSignHashAsync(
                providerEngine,
                orderHash,
                accounts[0]
            )
            res.status(HTTP_OK_STATUS).send({
                signature
            });
        }
    }
});
/**
 * DELETE Endpoint to delete an order from the relayer
 */
app.delete('/v2/order', (req, res) => {
    console.log('HTTP: DELETE order');
    const networkIdRaw = req.query.networkId;
    // tslint:disable-next-line:custom-no-magic-numbers
    const networkId = parseInt(networkIdRaw, 10);
    if (networkId !== NETWORK_CONFIGS.networkId) {
        console.log(`Incorrect Network ID: ${networkId}`);
        res.status(HTTP_BAD_REQUEST_STATUS).send({});
    } else {
        const orderHash = req.query.orderHash;
        if(!ordersByHash[orderHash]) {
            console.log(`Invalid order hash: ${orderHash}`);
            res.status(HTTP_BAD_REQUEST_STATUS).send({});
        } else {
            const order = ordersByHash[orderHash]
            orders.splice(
                orders.indexOf(order),
                1
            )
            delete ordersByHash[orderHash];
            res.status(HTTP_OK_STATUS).send({});
        }
    }
})
app.listen(HTTP_PORT, () => console.log(`Standard relayer API (HTTP) listening on port ${HTTP_PORT}!`));
function getCurrentUnixTimestampSec(): BigNumber {
    const milisecondsInSecond = 1000;
    return new BigNumber(Date.now() / milisecondsInSecond).round();
}
function renderOrderbookResponse(baseAssetData: string, quoteAssetData: string): OrderbookResponse {
    const bidOrders = orders.filter(order => {
        return (
            order.takerAssetData === baseAssetData &&
            order.makerAssetData === quoteAssetData &&
            order.expirationTimeSeconds.greaterThan(getCurrentUnixTimestampSec())
        );
    });
    const askOrders = orders.filter(order => {
        return (
            order.takerAssetData === quoteAssetData &&
            order.makerAssetData === baseAssetData &&
            order.expirationTimeSeconds.greaterThan(getCurrentUnixTimestampSec())
        );
    });
    const bidApiOrders: APIOrder[] = bidOrders.map(order => {
        return { metaData: {}, order };
    });
    const askApiOrders: APIOrder[] = askOrders.map(order => {
        return { metaData: {}, order };
    });
    return {
        bids: {
            records: bidApiOrders,
            page: 1,
            perPage: 100,
            total: bidOrders.length,
        },
        asks: {
            records: askApiOrders,
            page: 1,
            perPage: 100,
            total: askOrders.length,
        },
    };
}

// As the orders come in as JSON they need to be turned into the correct types such as BigNumber
function parseHTTPOrder(signedOrder: any): SignedOrder {
    signedOrder.salt = new BigNumber(signedOrder.salt);
    signedOrder.makerAssetAmount = new BigNumber(signedOrder.makerAssetAmount);
    signedOrder.takerAssetAmount = new BigNumber(signedOrder.takerAssetAmount);
    signedOrder.makerFee = new BigNumber(signedOrder.makerFee);
    signedOrder.takerFee = new BigNumber(signedOrder.takerFee);
    signedOrder.expirationTimeSeconds = new BigNumber(signedOrder.expirationTimeSeconds);
    return signedOrder;
}

function removeOrder(orderHash: string): void {
    const order = ordersByHash[orderHash];
    const orderIndex = orders.indexOf(order);
    if (orderIndex > -1) {
        orders.splice(orderIndex, 1);
    }
}