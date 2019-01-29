const fs = require('fs')
const util = require('util')
const utils = require('./utils')()

const fsPromiWriteFile = util.promisify(fs.writeFile)

function Deployer(web3, contractManager) {

    let chainTag

    const _getChainTag = async () => {
        if(!chainTag)
            chainTag = await web3.eth.getChainTag()
        return chainTag
    }

    // Returns a contract JSON from ContractManager
    const _getJsonForContract = (contract) => {
        let json
        let contracts = contractManager.getContracts()
        Object.keys(contracts).forEach((_contract) => {
            if(contracts[_contract].contract === contract)
                json = contracts[_contract].json
        })
        return json
    }

    // Checks for links in contract and replaces them in the contract bytecode if available
    const _getFormattedBytecode = async (contract) => {
        const json = _getJsonForContract(contract)
        let bytecode = json.bytecode

        const chainTag = await _getChainTag()

        if(json.chain_tags &&
            json.chain_tags.hasOwnProperty(chainTag) &&
            json.chain_tags[chainTag].links) {
            const libraries = Object.keys(json.chain_tags[chainTag].links)
            libraries.forEach((libraryName) => {
                let regex = new RegExp(`__${libraryName}__+`, 'g')
                bytecode = bytecode.replace(
                    regex,
                    json.chain_tags[chainTag].links[libraryName].substring(2) // Remove leading 0x
                )
            })
        }

        return bytecode
    }

    // Adds a linked contract address for the current chain tag
    const _addLinkToContractJson = async (libraryJson, contractJson) => {
        const chainTag = await _getChainTag()

        if(!contractJson.hasOwnProperty('chain_tags'))
            contractJson.chain_tags = {}

        if(!contractJson.chain_tags.hasOwnProperty(chainTag))
            contractJson.chain_tags[chainTag] = {}

        if(!contractJson.chain_tags[chainTag].hasOwnProperty('links'))
            contractJson.chain_tags[chainTag].links = {}

        const libraryName = libraryJson.contractName
        contractJson.chain_tags[chainTag].links[libraryName] = await _getContractAddress(libraryJson)
    }

    // Updates a contracts' address for the current chain tag
    const _updateContractJsonAddress = async (json, address) => {
        const chainTag = await _getChainTag()

        if(!json.hasOwnProperty('chain_tags'))
            json.chain_tags = {}

        const chainTagInfo = json.chain_tags[chainTag] ?
            json.chain_tags[chainTag] :
            {}

        json.chain_tags[chainTag] = {
            ...chainTagInfo,
            address
        }
    }

    // Returns a contracts' address for the current chain tag from it's JSON
    const _getContractAddress = async (json) => {
        const chainTag = await _getChainTag()

        if(!json.hasOwnProperty('chain_tags'))
            throw new Error(`Contract ${json.contractName} has not been deployed`)

        if(!json.chain_tags[chainTag])
            throw new Error(`Contract ${json.contractName} has not been deployed to current chain with tag: ${chainTag}`)

        return json.chain_tags[chainTag].address
    }

    // Updates a contract JSON in ../build/contracts
    const _updateContractJsonFile = async (json) => {
        const fileName = utils.getRootDir() + '/build/contracts/' + json.contractName + '.json'
        await fsPromiWriteFile(fileName, JSON.stringify(json))
    }

    // Updates a contract JSON in memory and in ../build/contracts
    const _updateContractJson = async (contract, instance) => {
        const json = _getJsonForContract(contract)
        const address = instance.options.address

        // Update JSON address
        await _updateContractJsonAddress(json, address)

        // Update JSON in memory
        contractManager.updateContractJson(contract, json)

        // Update JSON file
        await _updateContractJsonFile(json)
    }

    // Deploys a contract with provided bytecode and arguments
    const _deploy = async (contract, sendArgs, ...args) => {
        const bytecode = await _getFormattedBytecode(contract)
        return contract.deploy({
            data: bytecode,
            arguments: args
        }).send(sendArgs)
    }

    // Deploys a contract and updates the contract JSON
    this.deploy = (contract, ...args) => {
        return new Promise(async (resolve, reject) => {
            try {
                let sendArgs
                if(
                    args.length > 0 &&
                    typeof args[args.length - 1] === 'object'
                ) {
                    sendArgs = args[args.length - 1]
                    args.pop()
                }

                let instance = await _deploy(contract, sendArgs, ...args)

                await _updateContractJson(contract, instance)

                resolve(instance)
            } catch (e) {
                reject(e)
            }
        })
    }

    // Links a contract to a library contract and updates the contract JSON
    this.link = (library, contract) => {
        return new Promise(async (resolve, reject) => {
            try {
                const libraryJson = _getJsonForContract(library)
                const contractJson = _getJsonForContract(contract)

                await _addLinkToContractJson(libraryJson, contractJson)

                // Update contract JSON in memory
                contractManager.updateContractJson(contract, contractJson)

                // Update contract JSON file
                await _updateContractJsonFile(contractJson)

                resolve()
            } catch (e) {
                reject(e)
            }
        })
    }

}

module.exports = Deployer
