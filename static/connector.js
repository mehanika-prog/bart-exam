const path = require('path');
const fs = require('fs');

if (!fs.existsSync(process.env.FILES_PATH)) {
    fs.mkdirSync(process.env.FILES_PATH)
}

const createUserDirectory = function (userId) {

    logger.log('debug', 'Creating user directory.')

    fs.mkdirSync(path.join(process.env.FILES_PATH, userId))

    return true

}

const createGallery = function (name, userId) {

    logger.log('debug', 'Creating gallery.')

    fs.mkdirSync(path.join(process.env.FILES_PATH, userId, name))

    return true

}

const removeImage = function (f_path, userId) {

    logger.log('debug', 'Removing image.')

    fs.unlinkSync(path.join(process.env.FILES_PATH, userId, f_path))

    return true

}

const removeGallery = function (g_path, userId) {

    logger.log('debug', 'Removing gallery.')

    fs.rmSync(path.join(process.env.FILES_PATH, userId, g_path), { recursive: true, force: true })

    return true

}

const moveToGallery = function (filePath, galleryFullPath, filename) {

    logger.log('debug', 'Moving image to gallery.')

    fs.renameSync(filePath, path.join(process.env.FILES_PATH, galleryFullPath, filename))

    return true

}

module.exports = {

    createUserDirectory: createUserDirectory,
    createGallery: createGallery,
    removeGallery: removeGallery,
    removeImage: removeImage,
    moveToGallery: moveToGallery,

}
