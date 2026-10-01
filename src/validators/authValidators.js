const Joi = require("joi");

const registerSchema = Joi.object({
  name: Joi.string().trim().min(2).max(50).required(),
  email: Joi.string().trim().email().lowercase().required(),
  // min 8 chars, letters and numbers only, at least one of each
  password: Joi.string()
    .min(8)
    .max(64)
    .pattern(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]+$/)
    .required()
    .messages({
      "string.pattern.base":
        "Password must be alphanumeric and contain at least one letter and one number",
    }),
});

// Login is looser: we don't reveal password rules at login
const loginSchema = Joi.object({
  email: Joi.string().trim().email().lowercase().required(),
  password: Joi.string().required(),
});

const emailSchema = Joi.object({
  email: Joi.string().trim().email().lowercase().required(),
});

const verifyTokenSchema = Joi.object({
  token: Joi.string().hex().length(64).required(),
});

module.exports = { registerSchema, loginSchema, emailSchema, verifyTokenSchema };
