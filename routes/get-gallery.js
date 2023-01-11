const getGallery = function (request, h) {

    logger.log('info', 'Handling: GET /gallery.')

    const galleries = dbConnector.galleries.getByUserId(request.auth.credentials.userId)

    const response = {
        galleries: []
    }

    galleries.forEach(gallery => {

        response.galleries.push({
            path: gallery[dbConnector.galleries.structureIndexes.path],
            name: gallery[dbConnector.galleries.structureIndexes.name],
        })

    })

    return response

}

module.exports = {
    method: 'GET',
    path: '/gallery',
    options: {
        auth: 'default',
    },
    handler: getGallery
}
