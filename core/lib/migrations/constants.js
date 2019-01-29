const BigNumber = require('bignumber.js')

const symbolA = 1,
    symbolB = 2,
    symbolC = 3,
    symbolD = 4,
    symbolE = 5,
    symbolF = 6,
    symbolG = 7

const NUMBER_OF_LINES = 5,
    NUMBER_OF_REELS = 5

const CHANNEL_HOUSE_STARTING_BALANCE = new BigNumber(10000)
    .multipliedBy(new BigNumber(10).exponentiatedBy(18))
    .toFixed(0)

const reels = [
    [7, 2, 2, 1, 5, 3, 5, 3, 2, 2, 3, 4, 2, 5, 1, 1, 6, 4, 1, 5, 3],
    [1, 1, 3, 3, 5, 3, 5, 1, 2, 2, 4, 1, 3, 4, 3, 2, 2, 6, 6, 3, 7],
    [4, 2, 7, 3, 2, 6, 1, 4, 3, 1, 5, 1, 1, 4, 4, 1, 5, 2, 2, 1, 1],
    [1, 1, 5, 1, 2, 7, 4, 2, 1, 3, 2, 2, 3, 1, 1, 2, 6, 2, 6, 3, 5],
    [1, 4, 1, 1, 2, 4, 1, 3, 6, 2, 7, 2, 4, 1, 3, 1, 3, 6, 1, 2, 5]
]

const paytable = {}
paytable[symbolA] = 10
paytable[symbolB] = 20
paytable[symbolC] = 30
paytable[symbolD] = 50
paytable[symbolE] = 75
paytable[symbolF] = 150
paytable[symbolG] = 300

const BTC_KYC_LIMIT = 2
const DBET_BTC = 0.00004

const privateKeys = {
    nonFounder:
        '0x5c7f17702c636b560743b0dcb1b1d2b18e64de0667010ca4d9cac4f7119d0428',
    house: '0xf670adee34d38fc203ff707d7e7ef8946a6bb74fffdfc8d1a44c1e63eae86141',
    nonParticipant:
        '0xaf73426c6308b24bc720056ef3d1471ab7b531b2963de54d6ec6bb80153ec41d'
}

module.exports = {
    NUMBER_OF_LINES,
    NUMBER_OF_REELS,
    CHANNEL_HOUSE_STARTING_BALANCE,
    BTC_KYC_LIMIT,
    DBET_BTC,
    symbolA,
    symbolB,
    symbolC,
    symbolD,
    symbolE,
    symbolF,
    symbolG,
    paytable,
    privateKeys,
    reels
}
