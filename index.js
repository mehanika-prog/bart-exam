//==========/ Imports and validations. /==============================================================================//

require('dotenv').config()

const winston = require('winston')

global.logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    transports: [
        new winston.transports.File({
            filename: process.env.LOG_FILE_PATH || './logs/default.log',
        })
    ],
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.splat(),
        winston.format.simple(),
    ),
})

const {validateEnv, registerRoutes, authenticate} = require('./utils.js')

validateEnv()

const Hapi = require('@hapi/hapi')
const Jwt = require('@hapi/jwt');

global.dbConnector = require('./db/connector')
global.filesConnector = require('./static/connector')

//==========/ Server configuration. /=================================================================================//

const server = Hapi.server({
    port: process.env.SERVICE_PORT,
    routes: {
        files: {
            relativeTo: process.env.FILES_PATH
        }
    },
})

const initServer = async function(s) {

    await s.register(require('@hapi/inert'));

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

    registerRoutes(s, dbConnector)

}

//==========/ Server starting and state handling. /===================================================================//

initServer(server)
    .then(() => {
        server.start()
            .then(() => {
                logger.log('info', 'Server running on %s', server.info.uri)
            })
            .catch(e => {
                server.stop()
                    .then(() => {
                        logger.log('info', 'Server stopped after error!')
                        logger.log('error', e)
                        logger.log('info', 'Exiting process!')
                        process.exit(1)
                    })
                    .catch(se => {
                        logger.log('info', 'Error during server stopping!')
                        logger.log('error', se)
                        logger.log('info', 'Exiting process!')
                        process.exit(1)
                    })
            })

    })
    .catch(e => {
        logger.log('info', 'Error during server initializing!')
        logger.log('error', e)
        logger.log('info', 'Exiting process!')
        process.exit(1)
    })
