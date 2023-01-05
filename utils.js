const path = require('path')
const fs = require('fs')

const validateEnv = function() {

    if (!process.env.SERVICE_HOST) {
        throw new Error("Env variable \"SERVICE_HOST\" not specified!")
    }

    if (!process.env.SERVICE_PORT) {
        throw new Error("Env variable \"SERVICE_PORT\" not specified!")
    }

    if (!process.env.JWT_SECRET) {
        throw new Error("Env variable \"JWT_SECRET\" not specified!")
    }

}

const registerRoutes = function (server) {

    const routesPath = path.join(__dirname, 'routes')

    const fileNames = fs.readdirSync(routesPath)

    fileNames.forEach(fileName => {

        if (!fileName.endsWith('.example')) {

            console.log('Registering route from %s.', fileName)

            server.route(require(path.join(routesPath, fileName)))

        }

    })

}

const authenticate = function (artifacts, request, h) {
    return {
        isValid: true,
        credentials: {}
    }
}

module.exports = {

    validateEnv: validateEnv,
    registerRoutes: registerRoutes,
    authenticate: authenticate,

}
