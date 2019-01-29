let ethAbi
let ethAccounts

let contractInstances = {}

export default function ContractManager(web3, config) {
    ethAbi = web3.eth.abi
    ethAccounts = web3.eth.accounts

    /**
     * Calls a function on a contract
     * @param contractName
     * @param fnName
     * @param args
     */
    this.call = (contractName, fnName, args) => {
        return new Promise(async (resolve, reject) => {
            try {
                const contractInstance = this.getContractInstance(contractName)
                let result = await contractInstance.methods[fnName](
                    ...args
                ).call()
                resolve(result)
            } catch (e) {
                reject(e)
            }
        })
    }

    /**
     * Sends a signed raw transaction to a contract
     * @param contractName
     * @param functionName
     * @param args
     */
    this.sendTransaction = (contractName, functionName, args) => {
        return new Promise(async (resolve, reject) => {
            try {
                const contract = this.getContract(contractName)
                const address = this.getContractAddress(contract)
                const encodedFunctionCall = getEncodedFunctionCall(
                    contract,
                    functionName,
                    args
                )

                console.log('signTx', address, encodedFunctionCall, config.privateKey, config.address)
                let signedTx = await ethAccounts.signTransaction(
                    {
                        to: address,
                        data: encodedFunctionCall,
                        gas: 8000000
                    },
                    config.privateKey
                )
                console.log('Signed tx', signedTx)

                const tx = await web3.eth.sendSignedTransaction(signedTx.rawTransaction)
                resolve(tx)
            } catch (e) {
                console.error('Error sending signed tx', e.stack)
                reject(e)
            }
        })
    }

    /**
     * Retrieves past events emitted from a contract
     * @param contractName
     * @param eventName
     * @param options
     * @returns {Promise<EventLog[]>}
     */
    this.getPastEvents = (contractName, eventName, options) => {
        const contractInstance = this.getContractInstance(contractName)
        return contractInstance.getPastEvents(eventName, {
            fromBlock: options.fromBlock ? options.fromBlock : 0,
            toBlock: options.toBlock ? options.toBlock : 'latest',
            ...options
        })
    }

    /**
     * Returns a contract address based on it's name
     * @param contract
     * @returns {string}
     */
    this.getContractAddress = contract => {
        return config.isGanache?
            contract.networks[config.networkId].address :
            contract.chain_tags[config.chain_tag].address
    }

    /**
     * Returns a contract JSON based on it's name
     * @param name
     * @returns {*}
     */
    this.getContract = name => {
        return require(`./build/contracts/${name}.json`)
    }

    /**
     * Returns a web3.eth.Contract instance for a contract based on it's name
     * @param name
     */
    this.getContractInstance = name => {
        if (!contractInstances[name]) {
            const contract = this.getContract(name)
            const contractAddress = this.getContractAddress(contract)

            contractInstances[name] = new web3.eth.Contract(
                contract.abi,
                contractAddress
            )
        }
        return contractInstances[name]
    }

    /**
     * Returns inputs for a function ABI
     * @param contract
     * @param fnName
     */
    const getFunctionAbiInputs = (contract, fnName) => {
        let inputs = []
        contract.abi.forEach(fn => {
            if (fnName === fn.name) {
                inputs = fn.inputs
            }
        })
        return inputs
    }

    /**
     * Returns an encoded function call with arguments
     * @param contract
     * @param fnName
     * @param args
     */
    const getEncodedFunctionCall = (contract, fnName, args) => {
        const type = 'function'
        return ethAbi.encodeFunctionCall(
            {
                name: fnName,
                type,
                inputs: getFunctionAbiInputs(
                    contract,
                    fnName
                )
            },
            args
        )
    }
}
