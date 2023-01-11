const fs = require('fs')

const { v4: uuidv4 } = require('uuid')

const { getCSVData, writeCSVData, encryptPassword, capitalize} = require('../../utils')

const filename = 'images.csv'
const filepath = require('path').join(process.env.DATA_PATH, filename)
const structureIndexes = {
    id: 0,
    galleryId: 1,
    path: 2,
    fullPath: 3,
    name: 4,
    modified: 5,
}

if (!fs.existsSync(process.env.DATA_PATH)) {
    fs.mkdirSync(process.env.DATA_PATH)
}

if (!fs.existsSync(filepath)) {
    fs.writeFileSync(filepath, '')
}

const getById = function (id) {

    if (!id) throw new Error('Bad params!')

    logger.log('debug', 'Getting image by ID.')

    const imagesData = getCSVData(filepath)

    let image

    imagesData.forEach(imageData => {
        if (imageData[structureIndexes.id] === id) image = {
            id: imageData[structureIndexes.id],
            galleryId: imageData[structureIndexes.galleryId],
            path: imageData[structureIndexes.path],
            fullPath: imageData[structureIndexes.fullPath],
            name: imageData[structureIndexes.name],
            modified: imageData[structureIndexes.modified],
        }
    })

    return image

}

const getByGalleryId = function (galleryId) {

    if (!galleryId) throw new Error('Bad params!')

    logger.log('debug', 'Getting images by gallery ID.')

    const imagesData = getCSVData(filepath)

    const images = []

    imagesData.forEach(imageData => {
        if (imageData[structureIndexes.galleryId] === galleryId) images.push({
            id: imageData[structureIndexes.id],
            galleryId: imageData[structureIndexes.galleryId],
            path: imageData[structureIndexes.path],
            fullPath: imageData[structureIndexes.fullPath],
            name: imageData[structureIndexes.name],
            modified: imageData[structureIndexes.modified],
        })
    })

    return images

}

const getByGalleryIdAndPath = function (galleryId, path) {

    if (!galleryId || !path) throw new Error('Bad params!')

    logger.log('debug', 'Getting image by gallery ID and path.')

    const imagesData = getCSVData(filepath)

    let image

    imagesData.forEach(imageData => {
        if (
            imageData[structureIndexes.galleryId] === galleryId &&
            imageData[structureIndexes.path] === path
        ) image = {
            id: imageData[structureIndexes.id],
            galleryId: imageData[structureIndexes.galleryId],
            path: imageData[structureIndexes.path],
            fullPath: imageData[structureIndexes.fullPath],
            name: imageData[structureIndexes.name],
            modified: imageData[structureIndexes.modified],
        }
    })

    return image

}

const create = function (filename, gallery) {

    if (!filename || !gallery) throw new Error('Bad params!')

    logger.log('debug', 'Creating new image.')

    const name = capitalize(filename.split('.')[0])

    const imagesData = getCSVData(filepath)

    let exist = false

    imagesData.forEach(imageData => {
        if (imageData[structureIndexes.name] === name && imageData[structureIndexes.galleryId] === gallery.id) exist = true
    })

    if (exist) {
        logger.log('error', 'Image with this name already exist.')
        return null
    }

    const newImage = [
        uuidv4(),
        gallery.id,
        filename,
        require('path').join(gallery.path, filename),
        name,
        new Date().toUTCString().replace(',', '')
    ]

    imagesData.push(newImage)

    writeCSVData(filepath, imagesData)

    return {
        id: newImage[structureIndexes.id],
        galleryId: newImage[structureIndexes.galleryId],
        path: newImage[structureIndexes.path],
        fullPath: newImage[structureIndexes.fullPath],
        name: newImage[structureIndexes.name],
        modified: newImage[structureIndexes.modified],
    }

}

const removeById = function (id) {

    if (!id) throw new Error('Bad params!')

    const imagesData = getCSVData(filepath)

    writeCSVData(filepath, imagesData.filter(imageData => imageData[structureIndexes.id] !== id))

    return true

}

const removeByGalleryId = function (galleryId) {

    if (!galleryId) throw new Error('Bad params!')

    const imagesData = getCSVData(filepath)

    writeCSVData(filepath, imagesData.filter(imageData => imageData[structureIndexes.galleryId] !== galleryId))

    return true

}

module.exports = {

    structureIndexes: structureIndexes,
    create: create,
    removeById: removeById,
    removeByGalleryId: removeByGalleryId,
    getById: getById,
    getByGalleryId: getByGalleryId,
    getByGalleryIdAndPath: getByGalleryIdAndPath,

}
