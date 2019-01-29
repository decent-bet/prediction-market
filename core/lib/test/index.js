const OS = require("os")
const dir = require("node-dir")
const temp = require("temp")
const Config = require("truffle-config")
const Artifactor = require("truffle-artifactor")
const Test = require("./test")
const fs = require("fs")
const copy = require("./util/copy")
const Develop = require("./util/develop")
const Environment = require("./util/environment")
const argv = require('yargs').argv

let options = {
    contracts_directory: './contracts',
    contracts_build_directory: './build/contracts',
    test_directory: './test',
    logger: console
}

if(argv.file)
    options.file = argv.file

let done = (err, args) => {
    if(!err)
        console.log('Successfully completed tests without errors')
    return
}

let config = Config.detect(options)

// if "development" exists, default to using that for testing
if (!config.network && config.networks.development) {
    config.network = "development"
}

if (!config.network) {
    config.network = "test"
}

let ipcDisconnect

let files = []

if (options.file)
    files = [options.file]


function getFiles(callback) {
    if (files.length !== 0) {
        return callback(null, files)
    }

    dir.files(config.test_directory, 'file', callback, {recursive: false})
}

getFiles(function(err, files) {
    if (err) return done(err)

    files = files.filter(function(file) {
        return file.match(config.test_file_extension_regexp) != null
    })

    console.log('Files', files)

    temp.mkdir('test-', function(err, temporaryDirectory) {
        if (err) return done(err)

        function cleanup() {
            let args = arguments
            // Ensure directory cleanup.
            temp.cleanup(function(err) {
                // Ignore cleanup errors.
                done.apply(null, args)
                if (ipcDisconnect) {
                    ipcDisconnect()
                }
            })
        }

        function run() {
            // Set a new artifactor don't rely on the one created by Environments.
            // TODO: Make the test artifactor configurable.
            config.artifactor = new Artifactor(temporaryDirectory)

            Test.run(config.with({
                test_files: files,
                contracts_build_directory: temporaryDirectory
            }), cleanup)
        }

        let environmentCallback = function(err) {
            if (err) return done(err)
            // Copy all the built files over to a temporary directory, because we
            // don't want to save any tests artifacts. Only do this if the build directory
            // exists.
            fs.stat(config.contracts_build_directory, function(err, stat) {
                if (err) return run()

                copy(config.contracts_build_directory, temporaryDirectory, function(err) {
                    if (err) return done(err)

                    config.logger.log("Using network '" + config.network + "'." + OS.EOL)

                    run()
                })
            })
        }

        if (config.networks[config.network]) {
            Environment.detect(config, environmentCallback)
        } else {
            let ipcOptions = {
                network: "test"
            }

            let testrpcOptions = {
                host: "127.0.0.1",
                port: 7545,
                network_id: 4447,
                mnemonic: "candy maple cake sugar pudding cream honey rich smooth crumble sweet treat",
                gasLimit: config.gas
            }

            Develop.connectOrStart(ipcOptions, testrpcOptions, function(started, disconnect) {
                ipcDisconnect = disconnect
                Environment.develop(config, testrpcOptions, environmentCallback)
            })
        }
    })
})
