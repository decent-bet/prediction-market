const getTimestamp = () => Math.round(new Date().getTime())

export const Dashboard = {
    approveTokensDialog: {
        open: false,
        tx: {
            loading: false,
            error: false,
            success: false
        }
    },
    createBettingMarketDialog: {
        open: false,
        name: 'Price of ETH in 1 hour',
        category: 1,
        description: 'The price of Ethereum within 1 hours\'s time (from the time of being pushed to the contract) as of coinmarketcap.com',
        resolutionSource: 'coinmarketcap.com',
        eventStart: getTimestamp() + (60 * 60 * 1000),
        marketOpen: getTimestamp() + (60 * 1000),
        marketClose: getTimestamp() + (55 * 60 * 1000),
        outcomes: [
            '100-150$',
            '151-200$'
        ],
        outcomeName: '',
        tx: {
            loading: false,
            error: false,
            success: false
        }
    },
    fillOrderDialog: {
        open: false,
        marketId: null,
        order: null,
        type: null,
        outcome: null,
        tx: {
            loading: false,
            error: false,
            success: false
        }
    },
    balance: {
        loading: false,
        error: false,
        amount: 0
    },
    allowances: {
        loading: false,
        error: false,
        erc20Proxy: 0,
        bettingExchange: 0
    },
    markets: {
        loading: true,
        error: false,
        events: []
    },
    orderBooks: {
        loading: false,
        error: false,
        books: {}
    },
    placeOrder: {
        buy: {
            quantity: 0,
            price: 0,
        },
        sell: {
            quantity: 0,
            price: 0,
        },
        req: {
            loading: false,
            error: false,
            success: false
        }
    },
    baseDialog: {
        open: false,
        title: null,
        message: null
    },
    drawer: {
        open: false
    }
}
