const CONTRACT_NAME = 'Market'

/**
 * Module to help interact with the Market contract
 * @constructor
 */
export default function Market(contractManager) {

    this.address = contractManager.getContractAddress(
        contractManager.getContract(CONTRACT_NAME)
    )

    /**
     * Creates a new betting market
     * @param marketType
     * @param category
     * @param eventStart
     * @param marketOpen
     * @param marketClose
     * @param bytes32Outcomes
     * @param minBet
     * @param maxBet
     * @param ipfsHash
     */
    this.createBettingMarket = (
        marketType,
        category,
        eventStart,
        marketOpen,
        marketClose,
        bytes32Outcomes,
        minBet,
        maxBet,
        ipfsHash
    ) => {
        const name = 'createBettingMarket'
        console.log(name, {
            marketType,
            category,
            eventStart,
            marketOpen,
            marketClose,
            bytes32Outcomes,
            minBet,
            maxBet,
            ipfsHash
        })
        return contractManager.sendTransaction(CONTRACT_NAME, name, [
            marketType,
            category,
            eventStart,
            marketOpen,
            marketClose,
            bytes32Outcomes,
            minBet,
            maxBet,
            ipfsHash
        ])
    }

    /**
     * Returns market details for a given market ID
     * @param id
     */
    this.getMarket = id => {
        const name = 'markets'
        return contractManager.call(
            CONTRACT_NAME,
            name,
            [
                id
            ]
        )
    }

    /**
     * Returns the number of possible outcomes for a given market ID
     * @param id
     */
    this.getMarketOutcomeCount = id => {
        const name = 'getMarketOutcomeCount'
        return contractManager.call(
            CONTRACT_NAME,
            name,
            [
                id
            ]
        )
    }

    /**
     * Returns a market outcome at a provided index for a given market ID
     * @param id
     * @param index
     */
    this.getMarketOutcomeAtIndex = (id, index) => {
        const name = 'getMarketOutcomeAtIndex'
        return contractManager.call(
            CONTRACT_NAME,
            name,
            [
                id,
                index
            ]
        )
    }

    /**
     * Returns a market outcome share long/short token name for a provided market outcome
     * @param id
     * @param outcome
     * @param shareType
     */
    this.getMarketOutcomeShareTokenName = (
        id,
        outcome,
        shareType
    ) => {
        const name = 'getMarketOutcomeShareTokenName'
        return contractManager.call(
            CONTRACT_NAME,
            name,
            [
                id,
                outcome,
                shareType
            ]
        )
    }

    /**
     * Returns the address for a market outcome share token based on it's provided name
     * @param id
     * @param tokenName
     */
    this.getMarketOutcomeShareToken = (
        id,
        tokenName
    ) => {
        const name = 'getMarketOutcomeShareToken'
        return contractManager.call(
            CONTRACT_NAME,
            name,
            [
                id,
                tokenName
            ]
        )
    }

    /**
     * Logs past new market events
     * @param fromBlock
     * @param toBlock
     * @returns {Promise<[]>|*}
     */
    this.logPastNewMarketEvents = (
        fromBlock,
        toBlock
    ) => {
        const eventName = 'LogNewMarket'
        return contractManager.getPastEvents(
            CONTRACT_NAME,
            eventName,
            {
                fromBlock,
                toBlock
            }
        )
    }

}
