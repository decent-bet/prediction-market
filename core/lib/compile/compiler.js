const Config = require("truffle-config")
const Compile = require("truffle-compile")
const Resolver = require('truffle-resolver')
const Artifactor = require('truffle-artifactor')
const mkdirp = require("mkdirp")
const path = require("path")
const OS = require('os')

function Compiler() {

    this.compile = (options, callback) => {
        // Use a config object to ensure we get the default sources.
        const config = Config.default().merge(options)

        if (!config.resolver) {
            config.resolver = new Resolver(config)
        }

        if (!config.artifactor) {
            config.artifactor = new Artifactor(config.contracts_build_directory)
        }

        const finished = (err, contracts, paths) => {
            if (err) return callback(err)

            if (contracts != null && Object.keys(contracts).length > 0) {
                write_contracts(contracts, config, function (err, abstractions) {
                    callback(err, abstractions, paths)
                })
            } else {
                callback(null, [], paths)
            }
        }

        if (config.all === true || config.compileAll === true) {
            Compile.all(config, finished)
        } else {
            Compile.necessary(config, finished)
        }
    }

    const write_contracts = (contracts, options, callback) => {
        const logger = console

        mkdirp(options.contracts_build_directory, function (err, result) {
            if (err != null) {
                callback(err)
                return
            }

            if (options.quiet !== true && options.quietWrite !== true) {
                logger.log("Writing artifacts to ." +
                    path.sep + path.relative(options.working_directory, options.contracts_build_directory) + OS.EOL)
            }

            let extra_opts = {
                network_id: options.network_id
            }

            options.artifactor.saveAll(contracts, extra_opts).then(function () {
                callback(null, contracts)
            }).catch(callback)
        })
    }

}

module.exports = Compiler

