module.exports = {
    all: true,
    contracts_directory: './contracts',
    contracts_build_directory: './build/contracts',
    quiet: false,
    logger: console,
    solc: {
        optimizer: {
            enabled: true,
            runs: 200
        }
    }
}
