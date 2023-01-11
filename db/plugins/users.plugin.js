const fs = require('fs')

const { v4: uuidv4 } = require('uuid')

const { getCSVData, writeCSVData, encryptPassword } = require('../../utils')

const filename = 'users.csv'
const filepath = require('path').join(process.env.DATA_PATH, filename)
const structureIndexes = {
    id: 0,
    username: 1,
    password: 2,
    created: 3,
}

if (!fs.existsSync(process.env.DATA_PATH)) {
    fs.mkdirSync(process.env.DATA_PATH)
}

if (!fs.existsSync(filepath)) {
    fs.writeFileSync(filepath, '')
}

const getById = function (id) {

    if (!id) throw new Error('Bad params!')

    logger.log('debug', 'Getting user by ID.')

    const usersData = getCSVData(filepath)

    let user

    usersData.forEach(userData => {
        if (userData[structureIndexes.id] === id) user = {
            id: userData[structureIndexes.id],
            username: userData[structureIndexes.username],
            password: userData[structureIndexes.password],
        }
    })

    return user

}

const getByUsername = function (username) {

    if (!username) throw new Error('Bad params!')

    logger.log('debug', 'Getting user by username.')

    if (!username) return null

    const usersData = getCSVData(filepath)

    let user

    usersData.forEach(userData => {
        if (userData[structureIndexes.username] === username) user = {
            id: userData[structureIndexes.id],
            username: userData[structureIndexes.username],
            password: userData[structureIndexes.password],
        }
    })

    return user

}

const create = function (username, password) {

    if (!username || !password) throw new Error('Bad params!')

    logger.log('debug', 'Creating new user.')

    const usersData = getCSVData(filepath)

    let exist = false

    usersData.forEach(userData => {
        if (userData[structureIndexes.username] === username) exist = true
    })

    if (exist) {
        logger.log('error', 'User with this username already exist.')
        return null
    }

    const newUser = [uuidv4(), username, encryptPassword(password), new Date().toUTCString().replace(',', '')]

    usersData.push(newUser)

    writeCSVData(filepath, usersData)

    return {
        id: newUser[structureIndexes.id],
        username: newUser[structureIndexes.username],
        password: newUser[structureIndexes.password],
    }

}

module.exports = {

    structureIndexes: structureIndexes,
    create: create,
    getById: getById,
    getByUsername: getByUsername,

}
