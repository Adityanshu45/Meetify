import Joi from "joi";

const registerSchema = Joi.object({
  fullName: Joi.string()
    .trim()
    .pattern(/^[A-Za-z]+(?:[ -][A-Za-z]+)*$/)
    .required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).max(12).required(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).max(12).required(),
});

export { registerSchema, loginSchema };
