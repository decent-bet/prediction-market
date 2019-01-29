const exec = require('child_process').exec

const {
    COMMAND_APPROVE_AND_TRANSFER_DBETS
} = require('../src/utils/constants')

const command = `node ./index --command ${COMMAND_APPROVE_AND_TRANSFER_DBETS}`
console.log('Executing command:', command)
const script = exec(command)

script.stdout.on('data', function(data){
    console.info(data)
})

script.stderr.on('data', function(data){
    console.error(data)
})