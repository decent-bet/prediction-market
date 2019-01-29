# Decent.bet Prediction Market core contracts

Solidity based smart contracts that power the betting markets and exchange in the Decent.bet platform. 

## Pre-requisites

* [Yarn](https://yarnpkg.com)
* [Truffle](https://github.com/trufflesuite/truffle)
* [Ganache-cli](https://github.com/trufflesuite/ganache-cli)
* [Vechain Thor](https://github.com/vechain/thor)


## Setting up

1. [Install yarn](https://yarnpkg.com/lang/en/docs/install/)
   
1. Install [Vechain Thor](https://github.com/vechain/thor)

1. Install [Ganache-cli](https://github.com/trufflesuite/ganache-cli) (to run tests)

1. Clone this repository

1. Install the repository packages

    ```
    yarn install
    ```

## Instructions
    
1. Run Vechain Thor using the following command to run testnet

    ```
    bin/thor --network test
    ```
    
    Or run using the following command to run Thor in solo mode (equivalent of ganache-cli for Thor)
    
    ```
    bin/thor solo --on-demand
    ```
    
1. Configure your deployments according to the [Configuration](#configuration) section
    
1. To compile a fresh set of contracts, run

    ```
    yarn compile
    ```
    
    This will not run if contracts have already been compiled. 
    Delete ./build/contracts if you'd like to re-run this command.
    
1. To migrate/deploy contracts, run

    ```
    yarn migrate
    ```
    
    You can also specify chains by adding it as an arg,
    
    ```
    yarn migrate --chain solo
    ```
    
    Note that this will auto-compile contracts if ./build/contracts is empty
    
1. To run tests, run Ganache-cli with the following configuration
        
    **For development (Use a network ID of 10)**
    ```
        ganache-cli --mnemonic "mimic soda meat inmate cup someone labor odor invest scout fat ketchup" -i 10
    ```
    
1. Add an .env file to the current directory with the following variables

   ```
       MNEMONIC='<MNEMONIC TO DEPLOY CONTRACTS AND CONTR˚OL THE PLATFORM>'
       INFURA_KEY='<REGISTERED INFURA KEY>'
       DEFAULT_ACCOUNT='<DEFAULT ACCOUNT LINKED TO YOUR MNEMONIC>'
   ```
    
## Configuration

While running the migration script - the configuration is retrieved from vet-config.js. 
Each chain can be assigned a different set of configuration parameters. 
The parameters that can be changed are:

* host - The IP of the Thor node URL. Default: 'localhost'
* port - Port of the Thor node URL. Default: 8669 
* chain_tag - Chain tag of the network. Default: '0xcf'
* gasPrice - Gas price while deploying contracts. Default: '100000000000'
* privateKey - Private key for address deploying contracts.

### Available Tests

Tests would have to be run using ganache-cli as a simulation chain, this is because Thor
does not support RPC calls such as evm_snapshot which are exclusive to ganache-cli.

The test configuration can be changed in truffle-config.js. Whereas migration scripts can be found in ./migrations/test.

**Note that Vechain specific functionality such as MPP will NOT work with tests and is intended to test solely solidity contract code.**

To run tests, run the following commands 

* All tests

  ```
  yarn test
  ```
  
* Betting exchange

  ```
  yarn test-betting-exchange
  ```
  
* Market

  ```
  yarn test-market
  ```