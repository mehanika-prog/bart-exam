const Boom = require('@hapi/boom')

const getGalleryPath = function (request, h) {

    logger.log('info', 'Handling: GET /gallery/{path}.')

    const gallery = dbConnector.galleries.getByUserIdAndPath(request.auth.credentials.userId, request.params.path)

    if (!gallery) {
        logger.log('error', 'Can\'t find gallery with this name!')
        throw Boom.notFound('Can\'t find gallery with this name!')
    }

    return {
        gallery: {
            path: gallery.path,
            name: gallery.name,
        },
        images: dbConnector.images.getByGalleryId(gallery.id)
    }

}

module.exports = {
    method: 'GET',
    path: '/gallery/{path}',
    options: {
        auth: 'default',
    },
    handler: getGalleryPath
}
