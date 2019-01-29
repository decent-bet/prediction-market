const CryptoJS = require('crypto-js')

const BASE_PASSWORD = 'n>@b5YGLz"?jw)Q!'

class KeyHandler {
    /**
     * Caches a wallet's private key
     */
    set = ({ privateKey, address, mnemonic }) => {
        const encryptedPrivateKey = CryptoJS.AES.encrypt(
            privateKey,
            BASE_PASSWORD
        ).toString()
        localStorage.setItem('privateKey', encryptedPrivateKey)
        localStorage.setItem('address', address)

        if (mnemonic) {
            const encryptedMnemonic = CryptoJS.AES.encrypt(
                mnemonic,
                BASE_PASSWORD
            ).toString()
            localStorage.setItem('mnemonic', encryptedMnemonic)
        }
    }

    getPubAddress() {
        let vetPubAddress
        try {
            vetPubAddress = localStorage.getItem('vetPubAddress')
        } catch (e) {
            // log.error(`KeyHandler.js: Error getting private key: ${e.message}`)
        }
        return vetPubAddress
    }
    /**
     * Returns private key and mnemonic of the logged in user
     */
    get = () => {
        let address
        let privateKey
        let mnemonic
        try {
            address = localStorage.getItem('address')
            privateKey = CryptoJS.AES.decrypt(
                localStorage.getItem('privateKey'),
                BASE_PASSWORD
            ).toString(CryptoJS.enc.Utf8)
            mnemonic = CryptoJS.AES.decrypt(
                localStorage.getItem('mnemonic'),
                BASE_PASSWORD
            ).toString(CryptoJS.enc.Utf8)
        } catch (e) {
            console.error(`KeyHandler.js: Error getting private key: ${e.message}`)
        }
        return { mnemonic, privateKey, address }
    }

    /**
     * Returns address of the logged in user
     */
    getAddress = () => {
        return localStorage.getItem('address')
    }

    /**
     * Clears the logged in keys
     */
    clear = () => {
        localStorage.clear()
    }

    isLoggedIn = () => {
        return localStorage.getItem('address') != null
    }
}

export default KeyHandler
