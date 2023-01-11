const path = require('path')

const sharp = require('sharp')
const Boom = require("@hapi/boom");

const { xor, getNewSideSizes } = require('./../utils')

const getImagePreview = async function (request, h) {

    logger.log('info', 'Handling: GET /images/{w}x{h}/{g_path}/{i_path}.')

    const width = parseInt(request.params.w)
    const height = parseInt(request.params.h)
    const g_path = request.params.g_path
    const i_path = request.params.i_path

    const gallery = dbConnector.galleries.getByUserIdAndPath(request.auth.credentials.userId, g_path)
    if (!gallery) {
        logger.log('error', 'Can\'t find gallery with this name!')
        throw Boom.notFound('Can\'t find gallery with this name!')
    }

    const image = dbConnector.images.getByGalleryIdAndPath(gallery.id, i_path)
    if (!image) {
        logger.log('error', 'Can\'t find image on this path!')
        throw Boom.notFound('Can\'t find image on this path!')
    }

    const filePath = path.join(process.env.FILES_PATH, request.auth.credentials.userId, image.fullPath)

    let sFile = sharp(filePath)

    const fileMetadata = await sFile.metadata()

    let fileData

    if (fileMetadata.format === 'jpeg') {

        if (width === 0 && height === 0) {

            return h.file(filePath).code(200)

        } else if (xor(width === 0,  height === 0)) {

            const newSizes = getNewSideSizes(width, height, fileMetadata.width, fileMetadata.height)

            fileData = await sFile.resize(newSizes.width, newSizes.height, {
                fit: 'fill'
            }).toBuffer()

        } else {

            fileData = await sFile.resize(width, height, {
                fit: 'fill'
            }).toBuffer()

        }

    } else {

        sFile = sFile.jpeg({ mozjpeg: true })

        if (width === 0 && height === 0) {

            fileData = await sFile.toBuffer()

        } else if (xor(width === 0,  height === 0)) {

            const newSizes = getNewSideSizes(width, height, fileMetadata.width, fileMetadata.height)

            fileData = await sFile.resize(newSizes.width, newSizes.height, {
                fit: 'fill'
            }).toBuffer()

        } else {

            fileData = await sFile.resize(width, height, {
                fit: 'fill'
            }).toBuffer()

        }

    }

    return h.response(fileData)
        .type('image/jpeg')
        .header('Connection', 'keep-alive')
        .header('Cache-Control', 'no-cache')
        .code(200)

}

module.exports = {
    method: 'GET',
    path: '/images/{w}x{h}/{g_path}/{i_path}',
    options: {
        auth: 'default',
    },
    handler: getImagePreview
}
