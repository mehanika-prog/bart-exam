const Boom = require('@hapi/boom')

const getGalleryPath = function (request, h) {

    logger.log('info', 'Handling: GET /gallery/{path}.')

    const gallery = dbConnector.galleries.getByUserIdAndPath(request.auth.credentials.userId, request.params.path)

    if (!gallery) {
        logger.log('error', 'Can\'t find gallery with this name!')
        throw Boom.notFound('Can\'t find gallery with this name!')
    }

    const images = dbConnector.images.getByGalleryId(gallery.id)

    return h.response({
        gallery: {
            path: gallery.path.replace(/ /g, '%20'),
            name: gallery.name,
        },
        images: images.map(image => {
            image.path = image.path.replace(/ /g, '%20')
            image.fullPath = image.fullPath.replace(/ /g, '%20')
            return image
        })
    })
        .type('application/json')
        .code(200)

}

module.exports = {
    method: 'GET',
    path: '/gallery/{path}',
    options: {
        auth: 'default',
    },
    handler: getGalleryPath
}
