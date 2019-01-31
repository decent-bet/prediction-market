"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var _this = this;
exports.__esModule = true;
var _0x_js_1 = require("0x.js");
var bodyParser = require("body-parser");
var express = require("express");
var configs_1 = require("./configs");
var constants_1 = require("./constants");
var provider_engine_1 = require("./provider_engine");
var cors = require('cors');
var HTTP_OK_STATUS = 200;
var HTTP_BAD_REQUEST_STATUS = 400;
var HTTP_PORT = 4444;
// Global state
var orders = [];
var ordersByHash = {};
// Returns the contract address deployed on the connected network for a given contract name
function getContractAddress(name) {
    return require("../build/contracts/" + name + ".json").chain_tags['0xc7'].address.toLowerCase();
}
var contractWrappers = new _0x_js_1.ContractWrappers(provider_engine_1.providerEngine, {
    networkId: configs_1.NETWORK_CONFIGS.networkId,
    contractAddresses: {
        exchange: getContractAddress('Exchange'),
        erc20Proxy: getContractAddress('ERC20Proxy'),
        erc721Proxy: '0x1d7022f5b17d2f8b695918fb48fa1089c9f85401',
        zrxToken: getContractAddress('DBETVETToken'),
        etherToken: getContractAddress('DBETVETToken'),
        assetProxyOwner: getContractAddress('AssetProxyOwner'),
        forwarder: '0xb69e673309512a9d726f87304c6984054f87a93b',
        orderValidator: '0xe86bb98fcf9bff3512c74589b78fb168200cc546'
    }
});
// We subscribe to the Exchange Events to remove any filled or cancelled orders
contractWrappers.exchange.subscribe(_0x_js_1.ExchangeEvents.Fill, {}, function (err, decodedLogEvent) {
    if (err) {
        console.log('error:', err);
    }
    else if (decodedLogEvent) {
        var fillLog = decodedLogEvent.log;
        var orderHash = fillLog.args.orderHash;
        console.log("Order filled " + fillLog.args.orderHash);
        removeOrder(orderHash);
    }
});
// Listen for Cancel Exchange Events and remove any orders
contractWrappers.exchange.subscribe(_0x_js_1.ExchangeEvents.Cancel, {}, function (err, decodedLogEvent) {
    if (err) {
        console.log('error:', err);
    }
    else if (decodedLogEvent) {
        var fillLog = decodedLogEvent.log;
        var orderHash = fillLog.args.orderHash;
        console.log("Order cancelled " + fillLog.args.orderHash);
        removeOrder(orderHash);
    }
});
// HTTP Server
var app = express();
app.use(bodyParser.json());
app.use(cors());
/**
 * GET Orderbook endpoint retrieves the orderbook for a given asset pair.
 * http://sra-spec.s3-website-us-east-1.amazonaws.com/#operation/getOrderbook
 */
app.get('/v2/orderbook', function (req, res) {
    console.log('HTTP: GET orderbook');
    var baseAssetData = req.query.baseAssetData;
    var quoteAssetData = req.query.quoteAssetData;
    var networkIdRaw = req.query.networkId;
    // tslint:disable-next-line:custom-no-magic-numbers
    var networkId = parseInt(networkIdRaw, 10);
    if (networkId !== configs_1.NETWORK_CONFIGS.networkId) {
        console.log("Incorrect Network ID: " + networkId);
        res.status(HTTP_BAD_REQUEST_STATUS).send({});
    }
    else {
        var orderbookResponse = renderOrderbookResponse(baseAssetData, quoteAssetData);
        res.status(HTTP_OK_STATUS).send(orderbookResponse);
    }
});
/**
 * POST Order config endpoint retrives the values for order fields that the relayer requires.
 * http://sra-spec.s3-website-us-east-1.amazonaws.com/#operation/getOrderConfig
 */
app.post('/v2/order_config', function (req, res) {
    console.log('HTTP: POST order config');
    var networkIdRaw = req.query.networkId;
    // tslint:disable-next-line:custom-no-magic-numbers
    var networkId = parseInt(networkIdRaw, 10);
    if (networkId !== configs_1.NETWORK_CONFIGS.networkId) {
        console.log("Incorrect Network ID: " + networkId);
        res.status(HTTP_BAD_REQUEST_STATUS).send({});
    }
    else {
        var orderConfigResponse = {
            senderAddress: constants_1.NULL_ADDRESS,
            feeRecipientAddress: constants_1.NULL_ADDRESS,
            makerFee: constants_1.ZERO,
            takerFee: constants_1.ZERO
        };
        res.status(HTTP_OK_STATUS).send(orderConfigResponse);
    }
});
/**
 * POST Order endpoint submits an order to the Relayer.
 * http://sra-spec.s3-website-us-east-1.amazonaws.com/#operation/postOrder
 */
app.post('/v2/order', function (req, res) {
    console.log('HTTP: POST order');
    var networkIdRaw = req.query.networkId;
    // tslint:disable-next-line:custom-no-magic-numbers
    var networkId = parseInt(networkIdRaw, 10);
    if (networkId !== configs_1.NETWORK_CONFIGS.networkId) {
        console.log("Incorrect Network ID: " + networkId);
        res.status(HTTP_BAD_REQUEST_STATUS).send({});
    }
    else {
        var signedOrder = parseHTTPOrder(req.body);
        var orderHash = _0x_js_1.orderHashUtils.getOrderHashHex(signedOrder);
        ordersByHash[orderHash] = signedOrder;
        orders.push(signedOrder);
        res.status(HTTP_OK_STATUS).send({});
    }
});
/**
 * POST Sign order endpoint.
 * Used to obtain a relayer signature necessary to submit orders to betting exchange
 */
app.post('/v2/order/sign', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
    var networkIdRaw, networkId, orderHash, accounts, signature;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                console.log('HTTP: POST order');
                networkIdRaw = req.query.networkId;
                networkId = parseInt(networkIdRaw, 10);
                if (!(networkId !== configs_1.NETWORK_CONFIGS.networkId)) return [3 /*break*/, 1];
                console.log("Incorrect Network ID: " + networkId);
                res.status(HTTP_BAD_REQUEST_STATUS).send({});
                return [3 /*break*/, 5];
            case 1:
                orderHash = req.body.orderHash;
                if (!!ordersByHash[orderHash]) return [3 /*break*/, 2];
                console.log("Invalid order hash: " + orderHash);
                res.status(HTTP_BAD_REQUEST_STATUS).send({});
                return [3 /*break*/, 5];
            case 2: return [4 /*yield*/, provider_engine_1.mnemonicWallet.getAccountsAsync(1)];
            case 3:
                accounts = _a.sent();
                return [4 /*yield*/, _0x_js_1.signatureUtils.ecSignHashAsync(provider_engine_1.providerEngine, orderHash, accounts[0])];
            case 4:
                signature = _a.sent();
                res.status(HTTP_OK_STATUS).send({
                    signature: signature
                });
                _a.label = 5;
            case 5: return [2 /*return*/];
        }
    });
}); });
/**
 * DELETE Endpoint to delete an order from the relayer
 */
app["delete"]('/v2/order', function (req, res) {
    console.log('HTTP: DELETE order');
    var networkIdRaw = req.query.networkId;
    // tslint:disable-next-line:custom-no-magic-numbers
    var networkId = parseInt(networkIdRaw, 10);
    if (networkId !== configs_1.NETWORK_CONFIGS.networkId) {
        console.log("Incorrect Network ID: " + networkId);
        res.status(HTTP_BAD_REQUEST_STATUS).send({});
    }
    else {
        var orderHash = req.query.orderHash;
        if (!ordersByHash[orderHash]) {
            console.log("Invalid order hash: " + orderHash);
            res.status(HTTP_BAD_REQUEST_STATUS).send({});
        }
        else {
            var order = ordersByHash[orderHash];
            orders.splice(orders.indexOf(order), 1);
            delete ordersByHash[orderHash];
            res.status(HTTP_OK_STATUS).send({});
        }
    }
});
app.listen(HTTP_PORT, function () { return console.log("Standard relayer API (HTTP) listening on port " + HTTP_PORT + "!"); });
function getCurrentUnixTimestampSec() {
    var milisecondsInSecond = 1000;
    return new _0x_js_1.BigNumber(Date.now() / milisecondsInSecond).round();
}
function renderOrderbookResponse(baseAssetData, quoteAssetData) {
    var bidOrders = orders.filter(function (order) {
        return (order.takerAssetData === baseAssetData &&
            order.makerAssetData === quoteAssetData &&
            order.expirationTimeSeconds.greaterThan(getCurrentUnixTimestampSec()));
    });
    var askOrders = orders.filter(function (order) {
        return (order.takerAssetData === quoteAssetData &&
            order.makerAssetData === baseAssetData &&
            order.expirationTimeSeconds.greaterThan(getCurrentUnixTimestampSec()));
    });
    var bidApiOrders = bidOrders.map(function (order) {
        return { metaData: {}, order: order };
    });
    var askApiOrders = askOrders.map(function (order) {
        return { metaData: {}, order: order };
    });
    return {
        bids: {
            records: bidApiOrders,
            page: 1,
            perPage: 100,
            total: bidOrders.length
        },
        asks: {
            records: askApiOrders,
            page: 1,
            perPage: 100,
            total: askOrders.length
        }
    };
}
// As the orders come in as JSON they need to be turned into the correct types such as BigNumber
function parseHTTPOrder(signedOrder) {
    signedOrder.salt = new _0x_js_1.BigNumber(signedOrder.salt);
    signedOrder.makerAssetAmount = new _0x_js_1.BigNumber(signedOrder.makerAssetAmount);
    signedOrder.takerAssetAmount = new _0x_js_1.BigNumber(signedOrder.takerAssetAmount);
    signedOrder.makerFee = new _0x_js_1.BigNumber(signedOrder.makerFee);
    signedOrder.takerFee = new _0x_js_1.BigNumber(signedOrder.takerFee);
    signedOrder.expirationTimeSeconds = new _0x_js_1.BigNumber(signedOrder.expirationTimeSeconds);
    return signedOrder;
}
function removeOrder(orderHash) {
    var order = ordersByHash[orderHash];
    var orderIndex = orders.indexOf(order);
    if (orderIndex > -1) {
        orders.splice(orderIndex, 1);
    }
}
//# sourceMappingURL=index.js.map