const Compiler = require('./compiler')
const compiler = new Compiler()

const config = require('./config')

compiler.compile(config, (err, abstractions, paths) => {
    console.log(err ? err.message : 'Successfully compiled contracts')
})
