const {
    COMMAND_APPROVE_AND_TRANSFER_DBETS,
    MAX_VALUE
} = require('../utils/constants')

const {
    makerAddress,
    ownerAddress,
    takerAddress,
    web3
} = require('../web3')

const {
    bettingExchange,
    dbetVetToken,
    erc20Proxy
} = require('../contracts')(web3)

function ApproveAndTransferDbets() {

    this.type = COMMAND_APPROVE_AND_TRANSFER_DBETS

    const getAllowances = async address => {
        const erc20ProxyAllowance = await dbetVetToken.methods.allowance(
            address,
            erc20Proxy.options.address
        ).call()

        const bettingExchangeAllowance = await dbetVetToken.methods.allowance(
            address,
            bettingExchange.options.address
        ).call()

        return {
            erc20ProxyAllowance,
            bettingExchangeAllowance
        }
    }

    const approveIfInsufficientAllowance = async address => {
        const {
            erc20ProxyAllowance,
            bettingExchangeAllowance
        } = await getAllowances(address)

        if(erc20ProxyAllowance.toString() !== MAX_VALUE) {
            console.info(`ERC20 proxy allowance for ${address} != ${MAX_VALUE}`)
            await dbetVetToken.methods.approve(
                erc20Proxy.options.address,
                MAX_VALUE
            ).send({
                from: address,
                gas: 1000000
            })
            console.info(`Approved allowance for ${address} in ERC20 proxy`)
        } else
            console.info(`Allowance is already maximum in ERC20 proxy for ${address}`)

        if(bettingExchangeAllowance.toString() !== MAX_VALUE) {
            console.info(`Betting exchange allowance for ${address} != ${MAX_VALUE}`)
            await dbetVetToken.methods.approve(
                bettingExchange.options.address,
                MAX_VALUE
            ).send({
                from: address,
                gas: 1000000
            })
            console.info(`Approved allowance for ${address} in betting exchange`)
        } else
            console.info(`Allowance is already maximum in betting exchange for ${address}`)
    }

    const getBalances = async address => await dbetVetToken.methods.balanceOf(address).call()

    const transferIfInsufficientBalance = async address => {
        const balance = await getBalances(address)

        if(balance.toString() === '0') {
            console.info(`Transferring 10000 DBETs to ${address}`)
            await dbetVetToken.methods.transfer(
                address,
                web3.utils.toWei(
                    '10000',
                    'ether'
                )
            ).send({
                from: ownerAddress,
                gas: 100000
            })
        } else
            console.info(`${address} balance = ${web3.utils.fromWei(balance, 'ether')} DBETs`)
    }

    this.execute = async () => {
        try {
            await approveIfInsufficientAllowance(makerAddress)
            await approveIfInsufficientAllowance(takerAddress)

            await transferIfInsufficientBalance(makerAddress)
            await transferIfInsufficientBalance(takerAddress)
        } catch (e) {
            console.error('Error approving tokens', e.stack)
        }
        // Since web3 doesn't end it's connection
        process.exit()
    }
}

module.exports = new ApproveAndTransferDbets()