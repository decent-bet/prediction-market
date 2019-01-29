const CONTRACT_NAME = 'DBETVETToken'

/**
 * Module to help interact with the Market contract
 * @constructor
 */
export default function Token(contractManager) {

    this.address = contractManager.getContractAddress(
        contractManager.getContract(CONTRACT_NAME)
    )

    /**
     * Returns the allowance for a spender from an owner address
     * @param owner
     * @param spender
     */
    this.allowance = (
        owner,
        spender
    ) => {
        const name = 'allowance'
        return contractManager.call(
            CONTRACT_NAME,
            name,
            [
                owner,
                spender
            ]
        )
    }

    /**
     * Returns the balance of a provided address
     * @param address
     */
    this.balanceOf = (
        address
    ) => {
        const name = 'balanceOf'
        return contractManager.call(
            CONTRACT_NAME,
            name,
            [
                address
            ]
        )
    }

    /**
     * Approves an address to transfer "amount" DBETs on the tx senders' behalf
     * @param address
     * @param amount
     */
    this.approve = (
        address,
        amount
    ) => {
        const name = 'approve'
        return contractManager.sendTransaction(CONTRACT_NAME, name, [
            address,
            amount
        ])
    }



}
