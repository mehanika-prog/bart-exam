const path = require('path')
const fs = require('fs')
const { pbkdf2Sync } = require('crypto')

const validateEnv = function() {

    if (!process.env.SERVICE_PORT) {
        throw new Error("Env variable \"SERVICE_PORT\" not specified!")
    }

    if (!process.env.JWT_SECRET) {
        throw new Error("Env variable \"JWT_SECRET\" not specified!")
    }

    if (!process.env.DATA_PATH) {
        throw new Error("Env variable \"DATA_PATH\" not specified!")
    }

    if (!process.env.PASSWORDS_SECRET) {
        throw new Error("Env variable \"PASSWORDS_SECRET\" not specified!")
    }

    if (!process.env.FILES_PATH) {
        throw new Error("Env variable \"FILES_PATH\" not specified!")
    }

}

const getCSVData = function(path) {

    logger.log('debug', 'Getting CSV data.')

    const rawData = fs.readFileSync(path)

    const rawRows = rawData.toString().split('\n')

    const data = []

    rawRows.forEach(rawRow => {
        if (rawRow.length > 0) data.push(rawRow.split(','))
    })

    return data

}

const writeCSVData = function (path, data) {

    logger.log('debug', 'Writing CSV data.')

    if (!data) return

    let csv = ''

    data.forEach(row => {

        if (row.length > 0) {

            let first = true
            let subRow = ''

            row.forEach(col => {

                if (first) subRow += col
                else subRow += ',' + col

                first = false

            })

            if (subRow.length > 0) csv += subRow + '\n'

        }

    })

    fs.writeFileSync(path, csv)

}

const encryptPassword = function (password) {

    logger.log('debug', 'Encrypting password.')

    return pbkdf2Sync(password, process.env.PASSWORDS_SECRET, 16, 16, 'sha512').toString()

}

const registerRoutes = function (server, dbConnector) {

    const routesPath = path.join(__dirname, 'routes')

    const fileNames = fs.readdirSync(routesPath)

    fileNames.forEach(fileName => {

        if (!fileName.endsWith('.example') && !fileName.endsWith('.disable')) {

            logger.log('debug', 'Registering route from %s', fileName)

            server.route(require(path.join(routesPath, fileName)))

        }

    })

}

const authenticate = function (artifacts, request, h) {

    logger.log('debug', 'Authenticating.')

    const user = dbConnector.users.getById(artifacts.decoded.payload.userId)
    if (!user) logger.log('error', 'User not found.')

    return {
        isValid: user,
        credentials: user ? {
            userId: user.id,
            username: user.username,
        } : null
    }
}

const capitalize = function (str) {
    return str.charAt(0).toUpperCase() + str.slice(1)
}

const calculateSideSize = function (width, height, newValue, forWidth = true) {

    logger.log('debug', 'Calculating new %s size for image.', forWidth ? 'width' : 'height')

    if (forWidth) return newValue * width / height
    return newValue * height / width

}

const getNewSideSizes = function (width, height, o_width, o_height) {

    logger.log('debug', 'Calculating new side sizes for image.')

    const sizes = {
        width: 0,
        height: 0,
    }

    if (!width) {

        sizes.width = Math.round(calculateSideSize(o_width, o_height, height))
        sizes.height = height

    }

    if (!height) {

        sizes.width = width
        sizes.height = Math.round(calculateSideSize(o_width, o_height, width, false))

    }

    return sizes

}

const xor = function (a, b) {

    return ( a || b ) && !( a && b )

}

module.exports = {

    validateEnv: validateEnv,
    registerRoutes: registerRoutes,
    authenticate: authenticate,
    getCSVData: getCSVData,
    writeCSVData: writeCSVData,
    encryptPassword: encryptPassword,
    capitalize: capitalize,
    calculateSideSize: calculateSideSize,
    getNewSideSizes: getNewSideSizes,
    xor: xor,

}
