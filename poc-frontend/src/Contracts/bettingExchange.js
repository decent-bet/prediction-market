const CONTRACT_NAME = 'BettingExchange'

/**
 * Module to help interact with the BettingExchange contract
 * @constructor
 */
export default function BettingExchange(contractManager) {

    this.address = contractManager.getContractAddress(
        contractManager.getContract(CONTRACT_NAME)
    )

    /**
     * Fills a 0x order
     * @param marketId
     * @param outcome
     * @param isLong
     * @param order
     * @param takerAssetAmount
     * @param salt
     * @param makerSignature
     * @param takerSignature
     */
    this.fillOrder = (
        marketId,
        outcome,
        isLong,
        order,
        takerAssetAmount,
        salt,
        makerSignature,
        takerSignature
    ) => {
        const name = 'fillOrder'
        console.log(name, {
            marketId,
            outcome,
            isLong,
            order,
            takerAssetAmount,
            salt,
            makerSignature,
            takerSignature
        })
        return contractManager.sendTransaction(CONTRACT_NAME, name, [
            marketId,
            outcome,
            isLong,
            order,
            takerAssetAmount,
            salt,
            makerSignature,
            takerSignature
        ])
    }

}
