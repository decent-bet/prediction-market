const TestCase = require("mocha/lib/test.js")
const Suite = require("mocha/lib/suite.js")
const Deployer = require("truffle-deployer")
const find_contracts = require("truffle-contract-sources")
const compile = require("truffle-compile")
const artifactor = require("truffle-artifactor")
const contract = require("truffle-contract")
const series = require("async").series
const path = require("path")
const SolidityCoder = require("web3-0.20.6/lib/solidity/coder")

const SolidityTest = {
    define: function(abstraction, dependency_paths, runner, mocha) {
        const self = this

        let suite = new Suite(abstraction.contract_name, {})
        suite.timeout(runner.BEFORE_TIMEOUT)

        // Set up our runner's needs first.
        suite.beforeAll("prepare suite", function(done) {
            series([
                runner.initialize.bind(runner),
                self.compileNewAbstractInterface.bind(this, runner),
                self.deployTestDependencies.bind(this, abstraction, dependency_paths, runner)
            ], done)
        })

        suite.beforeEach("before test", function(done) {
            runner.startTest(this, done)
        })

        // Function that decodes raw logs from unlinked third party assertion
        // libraries and returns usable TestEvent logs
        function decodeTestEvents(result) {
            if (result.logs.length) return result.logs

            let logs = []
            let signature = web3.sha3('TestEvent(bool,string)')

            result.receipt.logs.forEach(function(log) {
                if (log.topics.length === 2 && log.topics[0] === signature){
                    let decoded = {
                        event: 'TestEvent',
                        args: {
                            result: SolidityCoder.decodeParams(['bool'], log.topics[1].replace("0x", ""))[0],
                            message: SolidityCoder.decodeParams(['string'], log.data.replace("0x", ""))[0]
                        }
                    }
                    logs.push(decoded)
                }
            })
            return logs
        }

        // Function that checks transaction logs to see if a test failed.
        function processResult(result) {
            result.logs = decodeTestEvents(result)

            result.logs.forEach(function(log) {
                if (log.event === "TestEvent" && log.args.result === false) {
                    throw new Error(log.args.message)
                }
            })
        }

        // Add functions from test file.
        abstraction.abi.forEach(function(item) {
            if (item.type !== "function") return

            ["beforeAll", "beforeEach", "afterAll", "afterEach"].forEach(function(fn_type) {
                if (item.name.indexOf(fn_type) === 0) {
                    suite[fn_type](item.name, function() {
                        return abstraction.deployed().then(function(deployed) {
                            return deployed[item.name]()
                        }).then(processResult)
                    })
                }
            })

            if (item.name.indexOf("test") === 0) {
                let test = new TestCase(item.name, function() {
                    return abstraction.deployed().then(function(deployed) {
                        return deployed[item.name]()
                    }).then(processResult)
                })

                test.timeout(runner.TEST_TIMEOUT)
                suite.addTest(test)
            }
        })

        suite.afterEach("after test", function(done) {
            runner.endTest(this, done)
        })

        mocha.suite.addSuite(suite)
    },

    compileNewAbstractInterface: function(runner, callback) {
        const self = this

        find_contracts(runner.config.contracts_directory, function(err, files) {
            if (err) return callback(err)

            compile.with_dependencies(runner.config.with({
                paths: [
                    "truffle/DeployedAddresses.sol",
                    path.join(__dirname, "SafeSend.sol")
                ],
                quiet: true
            }), function(err, contracts) {
                if (err) return callback(err)

                // Set network values.
                Object.keys(contracts).forEach(function(name) {
                    contracts[name].network_id = runner.config.network_id
                    contracts[name].default_network = runner.config.default_network
                })

                runner.config.artifactor.saveAll(contracts, runner.config.contracts_build_directory).then(function() {
                    callback()
                }).catch(callback)
            })
        })
    },

    deployTestDependencies: function(abstraction, dependency_paths, runner, callback) {
        let deployer = new Deployer(runner.config.with({
            logger: { log: function() {} }
        }))

        let Assert = runner.config.resolver.require("truffle/Assert.sol")
        let DeployedAddresses = runner.config.resolver.require("truffle/DeployedAddresses.sol")
        let SafeSend = runner.config.resolver.require("SafeSend.sol")

        deployer.deploy([
            Assert,
            DeployedAddresses
        ]).then(function() {
            dependency_paths.forEach(function(dependency_path) {
                let dependency = runner.config.resolver.require(dependency_path)

                if (dependency.isDeployed()) {
                    deployer.link(dependency, abstraction)
                }
            })
        })

        let deployed
        deployer.deploy(abstraction).then(function() {
            return abstraction.deployed()
        }).then(function(instance) {
            deployed = instance
            if (deployed.initialBalance) {
                return deployed.initialBalance.call()
            } else {
                return 0
            }
        }).then(function(balance) {
            if (balance !== 0) {
                return deployer.deploy(SafeSend, deployed.address, {
                    value: balance
                }).then(function() {
                    return SafeSend.deployed()
                }).then(function(safesend) {
                    return safesend.deliver()
                })
            }
        })

        deployer.start().then(function() {
            callback()
        }).catch(callback)
    }
}

module.exports = SolidityTest
