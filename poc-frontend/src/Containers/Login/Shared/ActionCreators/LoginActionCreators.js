import {
    LOGIN_USER_SUCCESS,
    LOGIN_USER_LOADING,
    LOGIN_USER_ERROR,
    SET_PRIVATE_KEY,
    SET_PASSWORD,
    TOGGLE_ERROR_DIALOG
} from '../ActionTypes/LoginActionTypes'
import { createAction } from 'redux-actions'
import { web3 } from '../../../../Contracts'

import KeyHandler from '../../../../Base/KeyHandler'
const keyHandler = new KeyHandler()

const HDWalletProvider = require('truffle-hdwallet-provider')

export function loginUser({
    privateKey,
    mnemonic
}) {
    return async dispatch => {
        dispatch({ type: LOGIN_USER_LOADING })
        try {
            // Mnemonic provided
            if(mnemonic) {
                const provider = new HDWalletProvider(
                    mnemonic,
                    'https://thor-test.decent.bet',
                    0
                )
                provider.addresses.map(address => {
                    web3.eth.accounts.wallet.add('0x' + provider.wallets[address]._privKey.toString('hex'))
                })
            } else {
                // Private key provided
                console.log('Adding private key', privateKey)
                web3.eth.accounts.wallet.add(privateKey)
            }

            console.log(web3.eth.accounts.wallet)

            keyHandler.set({
                privateKey,
                mnemonic,
                address: web3.eth.accounts.wallet[0].address
            })

            return dispatch({
                type: LOGIN_USER_SUCCESS
            })
        } catch (e) {
            return dispatch({
                type: LOGIN_USER_ERROR,
                error: e ,
                payload: 'Invalid private key/mnemonic'
            })
        }
    }
}

export const setPrivateKey = createAction(SET_PRIVATE_KEY, key => key)
export const setPassword = createAction(SET_PASSWORD, password => password)

export const toggleErrorDialog = createAction(
    TOGGLE_ERROR_DIALOG,
    ({ open, message }) => ({ open, message })
)
