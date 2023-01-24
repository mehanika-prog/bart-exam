const Joi = require('joi')
const Boom = require("@hapi/boom")
const Jwt = require('@hapi/jwt');

const { encryptPassword } = require('../utils')

const tokenExpirationDelay = parseInt(process.env.JWT_EXPIRATION) || 14400

const postLogin = function (request, h) {

    logger.log('info', 'Handling: POST /login.')

    const user = dbConnector.users.getByUsername(request.payload.username)

    if (!user) {
        logger.log('error', 'Can\'t find this user!')
        throw Boom.notFound('Can\'t find this user!')
    }
    if (user.password !== encryptPassword(request.payload.password)) {
        logger.log('error', 'Can\'t find this user!')
        throw Boom.notFound('Can\'t find this user!')
    }

    const token = Jwt.token.generate(
        {
            userId: user.id
        },
        {
            key: process.env.JWT_SECRET
        },
        {
            ttlSec: tokenExpirationDelay
        }
    )

    return h.response({ token: token })
        .type('application/json')
        .code(200)

}

module.exports = {
    method: 'POST',
    path: '/login',
    options: {
        auth: false,
        validate: {
            payload: Joi.object({
                username: Joi.string().required(),
                password: Joi.string().required(),
            }),
            options: {
                abortEarly: false,
            },
            failAction: (request, h, err) => {
                err.output.payload.message = err.output.payload.message.replace(/"/g, '\'', )
                delete err.output.payload.validation
                throw err;
            }
        },
        payload: {
            allow: 'application/json',
        },
    },
    handler: postLogin
}
