const { thorify } = require('thorify')

const Web3 = require('web3')
const web3 = new Web3()

const appRoot = require('app-root-path')
const argv = require('yargs').argv
const Config = require('../config')
const config = new Config()
const fs = require('fs')
const path = require('path')

const Compiler = require('../compile/compiler')
const compiler = new Compiler()
const compilerConfig = require('../compile/config')

const CHAIN_SOLO = 'solo',
      CHAIN_TESTNET = 'testnet'

const RELATIVE_BUILD_DIR = '../../build/contracts',
      FULL_BUILD_DIR = `${appRoot}/build/contracts`

const getDefaultChain = () => {
    return argv.chain ? argv.chain : CHAIN_TESTNET
}

// TODO: Retrieve this from script args. For eg: yarn migrate --chain testnet.
// TODO: Use testnet as default chain if not available.
console.log('Selected chain:', getDefaultChain())

const privateKey = config.getParam('privateKey')

console.log('Node URL', config.getNodeUrl())
thorify(web3, config.getNodeUrl())

const { contractManager, deployer } = require('../contracts')(web3)
const MigrationScript = require('../../migrations/vet/migrationscript')(web3, contractManager, deployer, { privateKey })

// Adds a private key to the web3 object wallet
const addPrivateKeyToWallet = async () => {
    web3.eth.accounts.wallet.add(privateKey)
    return true
}

// Creates full directories based on target dir
const mkDirByPathSync = (targetDir, {isRelativeToScript = false} = {}) => {
    const sep = path.sep
    const initDir = path.isAbsolute(targetDir) ? sep : ''
    const baseDir = isRelativeToScript ? __dirname : '.'

    targetDir.split(sep).reduce((parentDir, childDir) => {
        const curDir = path.resolve(baseDir, parentDir, childDir)
        try {
            fs.mkdirSync(curDir)
        } catch (err) {
            if (err.code !== 'EEXIST') {
                throw err
            }
        }
        return curDir
    }, initDir)
}

// Compiles contracts
const compile = () => {
    return new Promise((resolve, reject) => {
        console.log('Compiling contracts..')
        compiler.compile(compilerConfig, (err, abstractions, paths) => {
            console.log(err ? err.message : 'Successfully compiled contracts')
            if(!err)
                resolve()
            else
                reject(err)
        })
    })
}

// Check for files in build/contracts and if unavailable, compile contracts before running migrate
const compileIfNecessary = () => {
    return new Promise((resolve, reject) => {
        const tryAndCompile = async () => {
            try {
                await compile()
                resolve()
            } catch (e) {
                reject(e)
            }
        }

        // Check if build/contracts exists, create it if it doesn't, then compile contracts.
        fs.stat(FULL_BUILD_DIR, async (err, stats) => {
            if (err) {
                // Doesn't exist, create directory and compile
                mkDirByPathSync(RELATIVE_BUILD_DIR, {isRelativeToScript: true})
                await tryAndCompile()
            } else {
                if(!stats.isDirectory()) {
                    // Reject. Invalid file
                    reject('Invalid build file in root. Not a directory.')
                } else {
                    fs.readdir(FULL_BUILD_DIR, async (err, files) => {
                        if(!err) {
                            if(!files || (files && files.length === 0)) {
                                console.log('No files available in ', FULL_BUILD_DIR, 'Compiling contracts..')
                                await tryAndCompile()
                            } else {
                                console.log('Contracts have already been compiled. Migrating..')
                                resolve()
                            }
                        } else {
                            console.log('Error reading directory', RELATIVE_BUILD_DIR, err)
                            reject(new Error('Error reading build directory'))
                        }
                    })
                }
            }
        })
    })
}

function Migration() {
    // Initializes contract manager, adds private key to web3 and begins the migration script
    this.migrate = () => {
        return new Promise(async (resolve, reject) => {
            try {
                await compileIfNecessary()
                await contractManager.init()
                await addPrivateKeyToWallet()
                console.log('Deploying with address', web3.eth.accounts.wallet[0].address)
                await MigrationScript.migrate(getDefaultChain())
                resolve()
            } catch (e) {
                console.log('Error deploying contracts', e.message)
                reject(e)
            }
        })
    }
}

module.exports = Migration
