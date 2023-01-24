const Joi = require('joi')
const Boom = require("@hapi/boom");

const postGallery = function (request, h) {

    logger.log('info', 'Handling: POST /gallery.')

    const newGallery = dbConnector.galleries.create(request.payload.name, request.auth.credentials.userId)

    if (!newGallery) {
        logger.log('error', 'Gallery with this name already exist!')
        throw Boom.conflict('Gallery with this name already exist!')
    }

    const success = filesConnector.createGallery(request.payload.name, request.auth.credentials.userId)

    if (!success) {
        logger.log('error', 'Something went wrong.')
        throw Boom.badImplementation('Something went wrong.')
    }

    return h.response()
        .type('application/json')
        .code(201)
}

const minGalleryNameLength = parseInt(process.env.MIN_GALLARY_NAME_LENGTH) || 1
const maxGalleryNameLength = parseInt(process.env.MAX_GALLARY_NAME_LENGTH) || 32

module.exports = {
    method: 'POST',
    path: '/gallery',
    options: {
        auth: 'default',
        validate: {
            payload: Joi.object({
                name: Joi.string().required().min(minGalleryNameLength).max(maxGalleryNameLength).pattern(
                    /\//,
                    { invert: true }
                    ).message('Slash is not allowed as a part of gallery name!')
            }),
            options: {
                abortEarly: false,
            },
            failAction: (request, h, err) => {
                err.output.payload.message = err.output.payload.message.replace(/"/g, '\'', )
                delete err.output.payload.validation
                throw err
            }
        },
        payload: {
            allow: 'application/json'
        }
    },
    handler: postGallery
}
