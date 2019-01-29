const CONTRACT_NAME = 'Exchange'

/**
 * Module to help interact with the Exchange contract
 * @constructor
 */
export default function Exchange(contractManager) {

    this.address = contractManager.getContractAddress(
        contractManager.getContract(CONTRACT_NAME)
    )

    this.instance = contractManager.getContractInstance(CONTRACT_NAME)

}
