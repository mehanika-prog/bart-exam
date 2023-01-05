const Joi = require('joi');

const postLogin = function (request, h) {
    return ''
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
        }
    },
    handler: postLogin
}
