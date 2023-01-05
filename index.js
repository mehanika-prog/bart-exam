// TODO Winston logging

//==========/ Imports and validations. /==============================================================================//

require('dotenv').config()

const {validateEnv, registerRoutes, authenticate} = require('./utils.js')

validateEnv()

const Hapi = require('@hapi/hapi')
const Jwt = require('@hapi/jwt');

//==========/ Server configuration. /=================================================================================//

const server = Hapi.server({
    port: process.env.SERVICE_PORT,
    host: process.env.SERVICE_HOST,
})

const initServer = async function(s) {

    await s.register(Jwt)

    s.auth.strategy('default', 'jwt', {
        keys: process.env.JWT_SECRET,
        verify: {
            aud: process.env.JWT_AUD || false,
            iss: process.env.JWT_ISS || false,
            sub: process.env.JWT_SUB || false,
        },
        validate: authenticate
    })

    s.auth.default('default')

    registerRoutes(s)

}

//==========/ Server starting and state handling. /===================================================================//

initServer(server)
    .then(() => {
        server.start()
            .then(() => {
                console.log('Server running on %s', server.info.uri)
            })
            .catch(e => {
                server.stop()
                    .then(() => {
                        console.log('Server stopped after error!')
                        console.log(e)
                        console.log('Exiting process!')
                        process.exit(1)
                    })
                    .catch(se => {
                        console.log('Error during server stopping!')
                        console.log(se)
                        console.log('Exiting process!')
                        process.exit(1)
                    })
            })

    })
    .catch(e => {
        console.log('Error during server initializing!')
        console.log(e)
        console.log('Exiting process!')
        process.exit(1)
    })
