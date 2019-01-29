const {
    GANACHE_NETWORK_ID
} = require('./constants')

const getTimestamp = async web3 => (await web3.eth.getBlock('latest')).timestamp

const getContractAddress = name => require(`../../build/${name}`).networks[GANACHE_NETWORK_ID].address.toLowerCase()

const timeTravel = async (
    web3,
    bySeconds
) => new Promise((resolve, reject) => {
    web3.currentProvider.send(
        {
            jsonrpc: '2.0',
            method: 'evm_increaseTime',
            params: [bySeconds],
            id: 10
        },
        async (err, response) => {
            if (!err) {
                // await _mineOneBlock(web3)
                resolve(response)
            } else
                reject()
        }
    )
})

const _mineOneBlock = async web3 => new Promise((resolve, reject) => {
    web3.currentProvider.send(
        {
            jsonrpc: '2.0',
            method: 'evm_mine',
            id: 10
        },
        (err, response) => {
            if (!err) {
                resolve(response)
            } else reject()
        }
    )
})

module.exports = {
    getTimestamp,
    getContractAddress,
    timeTravel
}