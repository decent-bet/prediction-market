require('babel-register')({
    presets: [ 'env' ],
    plugins: [
        ['transform-runtime', {
            'regenerator': true
        }],
        "transform-object-rest-spread"
    ]
})

module.exports = require('./contracts.js')
