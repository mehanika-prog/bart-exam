const fs = require('fs')

const { v4: uuidv4 } = require('uuid')

const { getCSVData, writeCSVData, encryptPassword} = require('../../utils')

const filename = 'gallery.csv'
const filepath = require('path').join(process.env.DATA_PATH, filename)
const structureIndexes = {
    id: 0,
    userId: 1,
    name: 2,
    path: 3,
    modified: 4,
}

if (!fs.existsSync(process.env.DATA_PATH)) {
    fs.mkdirSync(process.env.DATA_PATH)
}

if (!fs.existsSync(filepath)) {
    fs.writeFileSync(filepath, '')
}

const getByUserId = function (userId) {

    if (!userId) throw new Error('Bad params!')

    logger.log('debug', 'Getting gallery by ID.')

    const galleriesData = getCSVData(filepath)

    return galleriesData.map(galleryData => {

        if (galleryData[structureIndexes.userId] === userId) return galleryData

    })

}

const getByUserIdAndPath = function (userId, path) {

    if (!userId || !path) throw new Error('Bad params!')

    logger.log('debug', 'Getting gallery by ID and path.')

    const galleriesData = getCSVData(filepath)

    const result = galleriesData.map(galleryData => {

        if (galleryData[structureIndexes.userId] === userId && galleryData[structureIndexes.path] === path) return galleryData

    }).filter(galleryData => galleryData)

    if (result.length < 1) {
        logger.log('error', 'Gallery not found.')
        return null
    }

    return {
        id: result[0][structureIndexes.id],
        userId: result[0][structureIndexes.userId],
        name: result[0][structureIndexes.name],
        path: result[0][structureIndexes.path],
        modified: result[0][structureIndexes.modified],
    }

}

const create = function (name, userId) {

    if (!name || !userId) throw new Error('Bad params!')

    logger.log('debug', 'Creating new gallery with name \'%s\'', name)

    const galleriesData = getCSVData(filepath)

    let exist = false

    galleriesData.forEach(galleryData => {
        if (galleryData[structureIndexes.name] === name) exist = true
    })

    if (exist) {
        logger.log('error', 'Gallery with this name already exist.')
        return null
    }

    const newGallery = [uuidv4(), userId, name, name, new Date().toUTCString().replace(',', '')]

    galleriesData.push(newGallery)

    writeCSVData(filepath, galleriesData)

    return {
        id: newGallery[structureIndexes.id],
        userId: newGallery[structureIndexes.userId],
        name: newGallery[structureIndexes.name],
        path: newGallery[structureIndexes.path],
        modified: newGallery[structureIndexes.modified],
    }

}

const setModifiedNow = function (id) {

    if (!id) throw new Error('Bad params!')

    logger.log('debug', 'Updating field \'modified\' of gallery.')

    const galleriesData = getCSVData(filepath)

    let exist = false

    galleriesData.forEach(galleryData => {

        if (galleryData[structureIndexes.id] === id)  {

            exist = true
            galleryData[structureIndexes.modified] = new Date().toUTCString().replace(',', '')

        }

    })

    if (!exist) {
        logger.log('error', 'Gallery with this ID not exist.')
        return false
    }

    writeCSVData(filepath, galleriesData)

    return true

}

const removeById = function (id) {

    if (!id) throw new Error('Bad params!')

    logger.log('debug', 'Removing gallery by ID.')

    const galleriesData = getCSVData(filepath)

    writeCSVData(filepath, galleriesData.filter(galleryData => galleryData[structureIndexes.id] !== id))

    return true

}

module.exports = {

    structureIndexes: structureIndexes,
    create: create,
    getByUserId: getByUserId,
    getByUserIdAndPath: getByUserIdAndPath,
    setModifiedNow: setModifiedNow,
    removeById: removeById,

}
