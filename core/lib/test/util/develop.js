const IPC = require('node-ipc').IPC
const path = require('path')
const spawn = require('child_process').spawn
const debug = require('debug')

const Develop = {
    start: function(ipcNetwork, options, callback) {
        options = options || {}

        let chainPath

        // The path to the dev env process depends on whether or not
        // we're running in the bundled version. If not, use chain.js
        // directly, otherwise let the bundle point at the bundled version.
        if (typeof BUNDLE_CHAIN_FILENAME !== "undefined") {
            // Remember: In the bundled version, __dirname refers to the
            // build directory where cli.bundled.js and cli.chain.js live.
            chainPath = path.join(__dirname, BUNDLE_CHAIN_FILENAME)
        } else {
            chainPath = path.join(__dirname, "../", "chain.js")
        }

        let cmd = spawn("node", [chainPath, ipcNetwork, JSON.stringify(options)], {
            detached: true,
            stdio: 'ignore'
        })

        callback()
    },

    connect: function(options, callback) {
        let debugServer = debug('develop:ipc:server')
        let debugClient = debug('develop:ipc:client')
        let debugRPC = debug('develop:testrpc')

        if (typeof options === 'function') {
            callback = options
            options = {}
        }

        options.retry = options.retry || false
        options.log = options.log || false
        options.network = options.network || "develop"
        let ipcNetwork = options.network

        let ipc = new IPC()
        ipc.config.appspace = "truffle."

        // set connectPath explicitly
        let dirname = ipc.config.socketRoot
        let basename = `${ipc.config.appspace}${ipcNetwork}`
        let connectPath = path.join(dirname, basename)

        ipc.config.silent = !debugClient.enabled
        ipc.config.logger = debugClient

        let loggers = {}

        if (debugServer.enabled)
            loggers.ipc = debugServer


        if (options.log) {
            debugRPC.enabled = true

            loggers.testrpc = function() {
                // HACK-y: replace `{}` that is getting logged instead of ""
                let args = Array.prototype.slice.call(arguments)
                if (args.length === 1 &&
                    typeof args[0] === "object" &&
                    Object.keys(args[0]).length === 0)
                {
                    args[0] = ""
                }

                debugRPC.apply(undefined, args)
            }
        }

        if (!options.retry)
            ipc.config.maxRetries = 0

        let disconnect = function() {
            ipc.disconnect(ipcNetwork)
        }

        ipc.connectTo(ipcNetwork, connectPath, function() {
            ipc.of[ipcNetwork].on('destroy', function() {
                callback(new Error("IPC connection destroyed"))
            })

            ipc.of[ipcNetwork].on('truffle.ready', function() {
                callback(null, disconnect)
            })

            Object.keys(loggers).forEach(function(key) {
                let log = loggers[key]
                if (log) {
                    let message = `truffle.${key}.log`
                    ipc.of[ipcNetwork].on(message, log)
                }
            })
        })
    },

    connectOrStart: function(options, testrpcOptions, callback) {
        const self = this

        options.retry = false

        let ipcNetwork = options.network || "develop"

        let connectedAlready = false

        this.connect(options, function(error, disconnect) {
            if (error) {
                self.start(ipcNetwork, testrpcOptions, function() {
                    options.retry = true;
                    self.connect(options, function(error, disconnect) {
                        if (connectedAlready) return

                        connectedAlready = true
                        callback(true, disconnect)
                    })
                })
            } else {
                connectedAlready = true
                callback(false, disconnect)
            }
        })
    }
}

module.exports = Develop
