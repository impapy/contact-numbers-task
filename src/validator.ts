import Joi from 'joi'
import { PASSWORD_MIN_LENGTH } from './constants'

const validator = (schema: Joi.ObjectSchema<any>) => (payload: object) => schema.validate(payload, { abortEarly: false })

const createUserSchema = Joi.object({
  username: Joi.string().min(3).max(15).required(),
  password: Joi.string().min(PASSWORD_MIN_LENGTH).required(),
})

const objectIdSchema = Joi.object({
  _id: Joi.string().min(24).max(24).required(),
})

const createContactSchema = Joi.object({
  name: Joi.string().required(),
  phone: Joi.string()
    .regex(/^01[0125]{1}[0-9]{8}$/, 'must add correct EG number')
    .required(),
  address: Joi.string().required(),
  notes: Joi.string().required(),
})

const createUpdateSchema = Joi.object({
  name: Joi.string().optional(),
  phone: Joi.string()
    .regex(/^01[0125]{1}[0-9]{8}$/, 'must add correct EG number')
    .optional(),
  address: Joi.string().optional(),
  notes: Joi.string().optional(),
})

export const validationCreateUser = validator(createUserSchema)

export const validationObjectId = validator(objectIdSchema)

export const validationCreateContact = validator(createContactSchema)

export const validationUpdateContact = validator(createUpdateSchema)
