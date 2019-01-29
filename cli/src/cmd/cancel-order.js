const {
    COMMAND_CANCEL_ORDER,
} = require('../utils/constants')

const {
    HttpClient
} = require('../relayer-http-client')

// Initialize the Standard Relayer API client
const httpClient = new HttpClient('http://localhost:4444/v2/')

function CancelOrder() {

    this.type = COMMAND_CANCEL_ORDER

    const getArgs = () => require('yargs')
        .option('orderHash', {
            alias: 'order_hash',
            describe: 'Order hash'
        })
        .demandOption([
            'orderHash',
        ], 'Please provide a valid order hash to cancel an order')
        .argv

    this.execute = async () => {
        const {
            orderHash
        } = getArgs()

        try {
            const response = await httpClient.cancelOrderAsync(orderHash)
            console.log(`Successfully cancelled order: ${orderHash}`)
            console.log('Response:', response)
        } catch (e) {
            console.error('Error cancelling order', e.stack)
        }
    }

}

module.exports = new CancelOrder()