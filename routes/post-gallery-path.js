const fs = require('fs')
const path = require('path')

const Joi = require('joi')
const Boom = require('@hapi/boom')

const { capitalize } = require('./../utils')

const postGalleryPath = function (request, h) {

    logger.log('info', 'Handling: POST /gallery/{path}.')

    const gallery = dbConnector.galleries.getByUserIdAndPath(request.auth.credentials.userId, request.params.path)

    if (!gallery) {
        logger.log('error', 'Can\'t find gallery with this name!')
        throw Boom.notFound('Can\'t find gallery with this name!')
    }

    const fileData = request.payload.image

    if (!['image/png', 'image/jpeg'].includes(fileData.headers['content-type'])) {
        fs.unlinkSync(fileData.path)
        logger.log('error', 'Only JPEG of PNG file extensions allowed!')
        throw Boom.badRequest('Only JPEG of PNG file extensions allowed!')
    }

    const image = dbConnector.images.create(fileData.filename, gallery)

    if (!image) {
        logger.log('error', 'Image with this name already exist!')
        throw Boom.conflict('Image with this name already exist!')
    }

    let success = filesConnector.moveToGallery(
        fileData.path,
        path.join(request.auth.credentials.userId, gallery.path),
        fileData.filename
    )

    if (!success) {
        logger.log('error', 'Something went wrong.')
        throw Boom.badImplementation('Something went wrong.')
    }

    success = dbConnector.galleries.setModifiedNow(gallery.id)

    if (!success) {
        logger.log('error', 'Something went wrong.')
        throw Boom.badImplementation('Something went wrong.')
    }

    const response = {

        uploaded: {

            path: fileData.filename,
            fullPath: gallery.path + '/' + fileData.filename,
            modified: new Date().toUTCString().replace(',', ''),
            name: capitalize(fileData.filename.split('.')[0])

        }

    }

    return h.response(response)
        .type('application/json')
        .code(201)

}

module.exports = {
    method: 'POST',
    path: '/gallery/{path}',
    options: {
        auth: 'default',
        validate: {
            payload: Joi.object({
                image: Joi.object()
            }),
            failAction: (request, h, err) => {
                err.output.payload.message = 'Key must be a \'image\'!'
                delete err.output.payload.validation
                throw err
            }
        },
        payload: {
            allow: 'multipart/form-data',
            multipart: true,
            maxBytes: parseInt(process.env.MAX_FILE_SIZE_BYTES) || 6553600,
            output: 'file',
        }
    },
    handler: postGalleryPath
}
