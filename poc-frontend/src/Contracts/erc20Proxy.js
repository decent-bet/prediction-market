const CONTRACT_NAME = 'ERC20Proxy'

/**
 * Module to help interact with the ERC20Proxy contract
 * @constructor
 */
export default function ERC20Proxy(contractManager) {

    this.address = contractManager.getContractAddress(
        contractManager.getContract(CONTRACT_NAME)
    )

}
