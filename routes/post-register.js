const Joi = require('joi')
const Boom = require("@hapi/boom")

const postRegister = function (request, h) {

    logger.log('info', 'Handling: POST /register.')

    const newUser = dbConnector.users.create(request.payload.username, request.payload.password)

    if (!newUser) throw Boom.conflict('This username already exist!')

    const success = filesConnector.createUserDirectory(newUser.id)

    if (!success) {
        logger.log('error', 'Something went wrong.')
        throw Boom.badImplementation('Something went wrong.')
    }

    return h.response()
        .type('application/json')
        .code(201)

}

const minUnameLen = parseInt(process.env.MIN_USERNAME_LENGTH) || 8
const maxUnameLen = parseInt(process.env.MAX_USERNAME_LENGTH) || 32
const minPasswdLen = parseInt(process.env.MIN_PASSWORD_LENGTH) || 8
const maxPasswdLen = parseInt(process.env.MAX_PASSWORD_LENGTH) || 32

module.exports = {
    method: 'POST',
    path: '/register',
    options: {
        auth: false,
        validate: {
            payload: Joi.object({
                username: Joi.string().required().min(minUnameLen).max(maxUnameLen),
                password: Joi.string().required().min(minPasswdLen).max(maxPasswdLen),
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
            allow: 'application/json',
        },
    },
    handler: postRegister
}
