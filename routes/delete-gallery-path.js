const Boom = require('@hapi/boom')

const deleteGalleryPath = function (request, h) {

    logger.log('info', 'Handling: DELETE /gallery/{path}.')

    const { g_path, i_path } = request.params

    const gallery = dbConnector.galleries.getByUserIdAndPath(request.auth.credentials.userId, g_path)

    if (!gallery) {
        logger.log('error', 'Can\'t find gallery with this name!')
        throw Boom.notFound('Can\'t find gallery with this name!')
    }

    let success = false

    if (i_path) {

        const image = dbConnector.images.getByGalleryIdAndPath(gallery.id, i_path)

        if (!image) {
            logger.log('error', 'Can\'t find image on this path!')
            throw Boom.notFound('Can\'t find image on this path!')
        }

        success = dbConnector.images.removeById(image.id) &&
            dbConnector.galleries.setModifiedNow(gallery.id) &&
            filesConnector.removeImage

    } else {

        success = dbConnector.galleries.removeById(gallery.id) &&
            dbConnector.images.removeByGalleryId(gallery.id) &&
            filesConnector.removeGallery(gallery.path, request.auth.credentials.userId)

    }

    if (!success) {
        logger.log('error', 'Something went wrong!')
        throw Boom.badImplementation('Something went wrong!')
    }

    return h.response().code(200)

}

module.exports = {
    method: 'DELETE',
    path: '/gallery/{g_path}/{i_path?}',
    options: {
        auth: 'default',
    },
    handler: deleteGalleryPath
}
