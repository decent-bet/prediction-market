const CONTRACT_NAME = 'AssetProxyOwner'

/**
 * Module to help interact with the AssetProxyOwner contract
 * @constructor
 */
export default function AssetProxyOwner(contractManager) {

    this.address = contractManager.getContractAddress(
        contractManager.getContract(CONTRACT_NAME)
    )

}
