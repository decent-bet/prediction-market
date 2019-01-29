const ApproveAndTransferDbets = require('./approve-and-transfer-dbets')
const CreateMarket = require('./create-market')
const PlaceOrder = require('./place-order')
const FillOrder = require('./fill-order')
const CancelOrder = require('./cancel-order')
const ResolveMarket = require('./resolve-market')
const ViewOrderBooks = require('./view-order-book')
const ClaimOutcomeShareTokens = require('./claim-outcome-share-tokens')

const commands = [
    ApproveAndTransferDbets,
    CreateMarket,
    PlaceOrder,
    FillOrder,
    CancelOrder,
    ResolveMarket,
    ViewOrderBooks,
    ClaimOutcomeShareTokens
]

module.exports = {
    ApproveAndTransferDbets,
    CreateMarket,
    PlaceOrder,
    FillOrder,
    CancelOrder,
    ResolveMarket,
    ViewOrderBooks,
    ClaimOutcomeShareTokens,
    commands
}