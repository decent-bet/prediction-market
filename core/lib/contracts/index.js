const ContractManager = require('./contractManager')
const Deployer = require('./deployer')
const Energy = require('./energy')

module.exports = (web3) => {
    const energy = new Energy(web3)
    const contractManager = new ContractManager(web3, energy)
    const deployer = new Deployer(web3, contractManager)

    return {
        contractManager,
        deployer
    }
}
