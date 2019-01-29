import { thorify } from 'thorify'

const Web3 = require('web3')
const BigNumber = require('bignumber.js')

const BettingProvider = require('../../build/contracts/BettingProvider.json')
const DecentBetToken = require('../../build/contracts/TestDecentBetToken.json')
const House = require('../../build/contracts/House.json')
const SlotsChannelManager = require('../../build/contracts/SlotsChannelManager.json')
const SportsOracle = require('../../build/contracts/SportsOracle.json')

const PROVIDER_URL = 'http://localhost:8669'
const web3 = new Web3()
thorify(web3, PROVIDER_URL)

const availableContracts = [
    BettingProvider,
    DecentBetToken,
    House,
    SlotsChannelManager,
    SportsOracle
]
let contracts = {}

const privateKey = require('../../vet-config').chains.testnet.privateKey
let account

let isMockTime

const getJsonContractAddress = json => {
    const chainTag = Object.keys(json.chain_tags)[0]
    return json.chain_tags[chainTag].address
}

const getDefaultOptions = () => {
    return {
        from: account.address,
        gas: 8000000,
    }
}

const getNewContractInstance = json => {
    const abi = json.abi
    return new web3.eth.Contract(abi, getJsonContractAddress(json), getDefaultOptions())
}

const getContractInstance = json => {
    return contracts[getJsonContractAddress(json)]
}

const mockTimeTravel = timeDiff => {
    if (isMockTime) {
        return new Promise(async (resolve, reject) => {
            let time = await getContractInstance(House)
                .methods.getTime()
                .call()
            time = new BigNumber(time)
            let newTime = time.plus(timeDiff).toNumber()

            getContractInstance(House)
                .methods.setTime(newTime)
                .send(getDefaultOptions())
                .on('transactionHash', hash => {
                    console.log('Sent set time tx for house. Hash:', hash)
                })
                .on('receipt', receipt => {
                    console.log('Set time tx for house added to block', receipt)
                    resolve()
                })
                .on('error', err => {
                    console.log(
                        'Error sending set time tx for house. Error:',
                        err.message
                    )
                    reject(err)
                })
        })
    } else return null
}

const timeTravel = async bySeconds => {
    return new Promise(async (resolve, reject) => {
        await mockTimeTravel(bySeconds)
        resolve()
    })
}

const getIsHouseMockTime = async () => {
    isMockTime = await getContractInstance(House)
        .methods
        .isMock()
        .call(getDefaultOptions())
    console.log('isMockTime', isMockTime)
}

const beginSessionZero = () => {
    return new Promise((resolve, reject) => {
        getContractInstance(House)
            .methods.beginNextSession()
            .send(getDefaultOptions())
            .on('transactionHash', hash => {
                console.log('Sent begin session zero tx. Hash:', hash)
            })
            .on('receipt', receipt => {
                console.log('Begin session zero tx added to block', receipt, receipt.outputs[0].events)
                resolve(receipt)
            })
            .on('error', err => {
                console.log(
                    'Error sending begin session zero tx. Error:',
                    err.message
                )
                reject(err)
            })
    })
}

const ownerFaucet = () => {
    return new Promise(async (resolve, reject) => {
        const currentSession = await getContractInstance(House).methods.currentSession().call()
        console.log('Current session', currentSession)

        getContractInstance(DecentBetToken)
            .methods.ownerFaucet()
            .send(getDefaultOptions())
            .on('transactionHash', hash => {
                console.log('Sent owner faucet tx. Hash:', hash)
            })
            .on('receipt', receipt => {
                console.log(
                    'Owner faucet tx added to block',
                    receipt.blockNumber
                )
                resolve()
            })
            .on('error', err => {
                console.log(
                    'Error sending owner faucet tx. Error:',
                    err.message
                )
                reject(err)
            })
    })
}

const approveAllowanceForHouseCredits = () => {
    return new Promise(async (resolve, reject) => {
        const balance = await getContractInstance(DecentBetToken).methods.balanceOf(account.address).call(getDefaultOptions())
        console.log('Token balance', balance)
        const amount = '50000000000000000000000000' // 50 Million tokens
        getContractInstance(DecentBetToken)
            .methods.approve(getJsonContractAddress(House), amount)
            .send(getDefaultOptions())
            .on('transactionHash', hash => {
                console.log(
                    'Sent approve allowance for house credits tx. Hash:',
                    hash
                )
            })
            .on('receipt', receipt => {
                console.log(
                    'Approve allowance for house credits tx added to block',
                    receipt.blockNumber
                )
                resolve()
            })
            .on('error', err => {
                console.log(
                    'Error sending approve allowance for house credits tx. Error:',
                    err.message
                )
                reject(err)
            })
    })
}

const purchaseHouseCredits = () => {
    return new Promise(async (resolve, reject) => {
        const amount = '50000000000000000000000000' // 50 Million tokens
        getContractInstance(House)
            .methods.purchaseCredits(amount)
            .send(getDefaultOptions())
            .on('transactionHash', hash => {
                console.log('Sent purchase house credits tx. Hash:', hash)
            })
            .on('receipt', receipt => {
                console.log(
                    'Purchase house credits tx added to block',
                    receipt.blockNumber
                )
                resolve()
            })
            .on('error', err => {
                console.log(
                    'Error sending purchase house credits tx. Error:',
                    err.message
                )
                reject(err)
            })
    })
}

const forwardToTokenAllocationWeek = async () => {
    const oneWeek = 7 * 24 * 60 * 60
    return timeTravel(oneWeek)
}

const allocateBettingProviderTokens = () => {
    return new Promise((resolve, reject) => {
        getContractInstance(House)
            .methods.allocateTokensForHouseOffering(
            '50',
            getJsonContractAddress(BettingProvider)
        )
            .send(getDefaultOptions())
            .on('transactionHash', hash => {
                console.log(
                    'Sent allocate house offering tx for betting provider. Hash:',
                    hash
                )
            })
            .on('receipt', receipt => {
                console.log(
                    'Allocate house offering tx for betting provider added to block',
                    receipt
                )
                resolve()
            })
            .on('error', err => {
                console.log(
                    'Error sending Allocate house offering tx for betting provider. Error:',
                    err.message
                )
                reject(err)
            })
    })
}

const allocateSlotsChannelManagerTokens = () => {
    return new Promise((resolve, reject) => {
        getContractInstance(House)
            .methods.allocateTokensForHouseOffering(
            '50',
            getJsonContractAddress(SlotsChannelManager)
        )
            .send(getDefaultOptions())
            .on('transactionHash', hash => {
                console.log(
                    'Sent allocate house offering tx for slots channel manager. Hash:',
                    hash
                )
            })
            .on('receipt', receipt => {
                console.log(
                    'Allocate house offering tx for slots channel manager added to block',
                    receipt
                )
                resolve()
            })
            .on('error', err => {
                console.log(
                    'Error sending Allocate house offering tx for slots channel manager. Error:',
                    err.message
                )
                reject(err)
            })
    })
}

const finalizeTokenAllocations = () => {
    return new Promise((resolve, reject) => {
        getContractInstance(House)
            .methods.finalizeTokenAllocations()
            .send(getDefaultOptions())
            .on('transactionHash', hash => {
                console.log(
                    'Sent finalize token allocations to house. Hash:',
                    hash
                )
            })
            .on('receipt', receipt => {
                console.log(
                    'Finalize token allocations tx added to block',
                    receipt.blockNumber
                )
                resolve()
            })
            .on('error', err => {
                console.log(
                    'Error sending finalize token allocations to house tx . Error:',
                    err.message
                )
                reject(err)
            })
    })
}

const depositToBettingProvider = () => {
    return new Promise((resolve, reject) => {
        getContractInstance(House)
            .methods.depositAllocatedTokensToHouseOffering(
            getJsonContractAddress(BettingProvider)
        )
            .send(getDefaultOptions())
            .on('transactionHash', hash => {
                console.log('Sent deposit to betting provider. Hash:', hash)
            })
            .on('receipt', receipt => {
                console.log(
                    'Deposit to betting provider tx added to block',
                    receipt.blockNumber
                )
                resolve()
            })
            .on('error', err => {
                console.log(
                    'Error sending deposit to betting provider tx . Error:',
                    err.message
                )
                reject(err)
            })
    })
}

const depositToSlotsChannelManager = () => {
    return new Promise((resolve, reject) => {
        getContractInstance(House)
            .methods.depositAllocatedTokensToHouseOffering(
            getJsonContractAddress(SlotsChannelManager)
        )
            .send(getDefaultOptions())
            .on('transactionHash', hash => {
                console.log(
                    'Sent deposit to slots channel manager. Hash:',
                    hash
                )
            })
            .on('receipt', receipt => {
                console.log(
                    'Deposit to slots channel manager tx added to block',
                    receipt.blockNumber
                )
                resolve()
            })
            .on('error', err => {
                console.log(
                    'Error sending deposit to slots channel manager tx . Error:',
                    err.message
                )
                reject(err)
            })
    })
}

const forwardToSessionOne = () => {
    let oneWeek = 7 * 24 * 60 * 60
    return timeTravel(oneWeek)
}

const beginSessionOne = () => {
    return new Promise((resolve, reject) => {
        getContractInstance(House)
            .methods.beginNextSession()
            .send(getDefaultOptions())
            .on('transactionHash', hash => {
                console.log('Sent begin session one tx. Hash:', hash)
            })
            .on('receipt', receipt => {
                console.log(
                    'Begin session one tx added to block',
                    receipt.blockNumber
                )
                resolve()
            })
            .on('error', err => {
                console.log(
                    'Error sending begin session one tx. Error:',
                    err.message
                )
                reject(err)
            })
    })
}

const setSportsOracleInBettingProvider = () => {
    return new Promise((resolve, reject) => {
        getContractInstance(BettingProvider)
            .methods.setSportsOracle(getJsonContractAddress(SportsOracle))
            .send(getDefaultOptions())
            .on('transactionHash', hash => {
                console.log(
                    'Sent set sports oracle in betting provider tx. Hash:',
                    hash
                )
            })
            .on('receipt', receipt => {
                console.log(
                    'Set sports oracle in betting provider tx added to block',
                    receipt.blockNumber
                )
                resolve()
            })
            .on('error', err => {
                console.log(
                    'Error sending set sports oracle in betting provider tx. Error:',
                    err.message
                )
                reject(err)
            })
    })
}

const acceptBettingProviderInSportsOracle = () => {
    return new Promise((resolve, reject) => {
        getContractInstance(SportsOracle)
            .methods.acceptProvider(getJsonContractAddress(BettingProvider))
            .send(getDefaultOptions())
            .on('transactionHash', hash => {
                console.log(
                    'Sent accept betting provider in sports oracle tx. Hash:',
                    hash
                )
            })
            .on('receipt', receipt => {
                console.log(
                    'Accept betting provider in sports oracle tx added to block',
                    receipt.blockNumber
                )
                resolve()
            })
            .on('error', err => {
                console.log(
                    'Error sending accept betting provider in sports oracle tx. Error:',
                    err.message
                )
                reject(err)
            })
    })
}

const sendTransactions = async () => {
    await getIsHouseMockTime()
    await beginSessionZero()
    await ownerFaucet()
    await approveAllowanceForHouseCredits()
    await purchaseHouseCredits()
    await forwardToTokenAllocationWeek()
    await allocateBettingProviderTokens()
    await allocateSlotsChannelManagerTokens()
    await finalizeTokenAllocations()
    await depositToBettingProvider()
    await depositToSlotsChannelManager()
    await forwardToSessionOne()
    await beginSessionOne()
    await setSportsOracleInBettingProvider()
    await acceptBettingProviderInSportsOracle()
}

(async () => {
    account = web3.eth.accounts.privateKeyToAccount(privateKey)
    web3.eth.accounts.wallet.add(privateKey)
    availableContracts.forEach(_contract => {
        contracts[getJsonContractAddress(_contract)] = getNewContractInstance(
            _contract
        )
    })
    await sendTransactions()
    console.log('Successfully sent transactions')
    process.exit()
})().catch(e => {
    console.log('Error initializing accounts and contract instances', e.message)
})
