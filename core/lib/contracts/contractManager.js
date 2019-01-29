const nodeDir = require('node-dir')
const utils = require('./utils')()

function ContractManager (web3, energy) {

    let contracts

    const PATH_SEPARATOR = '/'
    const CONTRACT_NAME_ENERGY = 'Energy'

    // Initializes a contract within the contracts object
    const _initContract = (_contracts, path, root, dir, file) => {
        const name = file
            .replace(path + PATH_SEPARATOR, '')
            .replace('.json', '')

        const fileName =
            root +
            dir +
            file.replace(path, '')

        _contracts[name] = {
            contract: new web3.eth.Contract(require(fileName).abi),
            json: require(fileName)
        }
    }

    // Retrieves all contracts from compiled JSONs in ../build/contracts
    const _getContractsFromJsonFiles = (root, dir) => {
        return new Promise((resolve, reject) => {
            const path =
                utils.getRootDir() + PATH_SEPARATOR + dir
            nodeDir
                .promiseFiles(path)
                .then(files => {
                    const _contracts = {}
                    files.map(file => _initContract(_contracts, path, root, dir, file))
                    resolve(_contracts)
                })
                .catch(e => reject(e))
        })
    }

    // Initializes the contract manager
    this.init = async () => {
        contracts = await _getContractsFromJsonFiles('../../', 'build/contracts')
        contracts[CONTRACT_NAME_ENERGY] = energy
    }

    // Returns a contract by name
    this.getContract = (name) => {
        return contracts[name].contract
    }

    // Returns all contracts
    this.getContracts = () => {
        return contracts
    }

    // Updates a contract JSON within the contracts object
    this.updateContractJson = (contract, json) => {
        Object.keys(contracts).forEach((_contract) => {
            if(contracts[_contract].contract === contract)
                contracts[_contract].json = json
        })
    }

}

module.exports = ContractManager
