const {
    HttpClient
} = require('@0x/connect')

/**
 * Extends the 0x http client to include methods for cancel and sign order API calls
 */
HttpClient.prototype.cancelOrderAsync = async function (orderHash, requestOpts) {
    await this._requestAsync(
        `/order/${orderHash}`,
        'DELETE',
        {
            params: requestOpts,
        }
    )
}

module.exports = {
    HttpClient
}