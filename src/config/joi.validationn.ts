import * as Joi from 'joi'
/* crear un schema validation */
export const JoinValidationSchema = Joi.object({
    MONGODB: Joi.required(),
    PORT: Joi.number().default(3000),
    DEFAULT_LIMIT: Joi.number().default(6)
})