const Web3 = require("web3-0.20.6")
const TruffleError = require("truffle-error")
const expect = require("truffle-expect")
const Resolver = require("truffle-resolver")
const Artifactor = require("truffle-artifactor")
const TestRPC = require("ganache-cli")

const Environment = {
    // It's important config is a Config object and not a vanilla object
    detect: function(config, callback) {
        expect.options(config, [
            "networks"
        ])

        if (!config.resolver) {
            config.resolver = new Resolver(config)
        }

        if (!config.artifactor) {
            config.artifactor = new Artifactor(config.contracts_build_directory)
        }

        if (!config.network && config.networks["development"]) {
            config.network = "development"
        }

        if (!config.network) {
            return callback(new Error("No network specified. Cannot determine current network."))
        }

        let network_config = config.networks[config.network]

        if (!network_config) {
            return callback(new TruffleError("Unknown network \"" + config.network + "\". See your Truffle configuration file for available networks."))
        }

        let network_id = config.networks[config.network].network_id

        if (network_id == null) {
            return callback(new Error("You must specify a network_id in your '" + config.network + "' configuration in order to use this network."))
        }

        let web3 = new Web3(config.provider)

        function detectNetworkId(done) {
            if (network_id !== "*") {
                return done(null, network_id)
            }

            // We have a "*" network. Get the current network and replace it with the real one.
            // TODO: Should we replace this with the blockchain uri?
            web3.version.getNetwork(function(err, id) {
                if (err) return callback(err)
                network_id = id
                config.networks[config.network].network_id = network_id
                done(null, network_id)
            })
        }

        function detectFromAddress(done) {
            if (config.from) {
                return done()
            }

            web3.eth.getAccounts(function(err, accounts) {
                if (err) return done(err)
                config.networks[config.network].from = accounts[0]
                done()
            })
        }

        detectNetworkId(function(err) {
            if (err) return callback(err)
            detectFromAddress(callback)
        })
    },

    // Ensure you call Environment.detect() first.
    fork: function(config, callback) {
        expect.options(config, [
            "from"
        ])

        let web3 = new Web3(config.provider)

        web3.eth.getAccounts(function(err, accounts) {
            if (err) return callback(err)

            let upstreamNetwork = config.network
            let upstreamConfig = config.networks[upstreamNetwork]
            let forkedNetwork = config.network + "-fork"

            config.networks[forkedNetwork] = {
                network_id: config.network_id,
                provider: TestRPC.provider({
                    fork: config.provider,
                    unlocked_accounts: accounts
                }),
                from: config.from
            }
            config.network = forkedNetwork

            callback()
        })
    },

    develop: function(config, testrpcOptions, callback) {
        expect.options(config, [
            "networks",
        ])

        let network = config.network || "develop"
        let url = `http://${testrpcOptions.host}:${testrpcOptions.port}/`

        config.networks[network] = {
            network_id: testrpcOptions.network_id,
            provider: function() {
                return new Web3.providers.HttpProvider(url)
            }
        }

        config.network = network

        Environment.detect(config, callback)
    }
}

module.exports = Environment
