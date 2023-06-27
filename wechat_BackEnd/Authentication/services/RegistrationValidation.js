const Joi = require('joi');

const registrationSchema = Joi.object({
    userName: Joi.string()
        .required()
        .min(5),
    email: Joi.string()
        .email({ minDomainSegments: 2, tlds: { allow: ['com'] } }),
    password: Joi.string()
        .min(8)
        .max(30)
        .pattern(new RegExp('^(?=. *[a-zA-Z])(?=.*[0-9])(?=.*[!@#\\$%\\^&\\*])(?=.{8,})'))
        .required(),
    profileImage: Joi.string().uri(),
}).xor('email');

const validateCreateUserSchema = (payload) => {
    return registrationSchema.validateAsync(payload, { abortEarly: false })
}
module.exports = validateCreateUserSchema