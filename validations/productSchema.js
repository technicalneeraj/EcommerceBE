const Joi = require("joi");

const productSchema = Joi.object({
  name: Joi.string().trim().required().messages({
    "string.base": '"name" should be a type of string',
    "string.empty": '"name" cannot be an empty field',
    "any.required": '"name" is a required field',
  }),

  description: Joi.string().trim().required().messages({
    "string.base": '"description" should be a type of string',
    "string.empty": '"description" cannot be an empty field',
    "any.required": '"description" is a required field',
  }),

  category: Joi.string().required().messages({
    "any.required": '"category" is a required field',
  }),

  sku: Joi.string().required().messages({
    "any.required": '"sku" is a required field',
  }),

  price: Joi.number().min(0).required().messages({
    "any.required": '"price" is a required field',
    "number.base": '"price" should be a type of number',
    "number.min": '"price" cant be negative',
  }),

  discountPrice: Joi.number().optional().min(0).default(0).messages({
    "number.base": '"discount price" should be a type of number',
    "number.min": '"discount price" cant be negative',
  }),

  stock: Joi.number().min(0).required().messages({
    "any.required": '"stock" is a required field',
    "number.base": '"stock" should be a type of number',
    "number.min": '"stock" must be at least 0',
  }),

  isFeatured: Joi.boolean().default(false).messages({
    "boolean.base": '"isFeatured" should be a boolean',
  }),

  status: Joi.string()
    .valid("active", "inactive", "out-of-stock")
    .default("active")
    .messages({
      "string.base": '"status" should be a type of string',
      "any.only": '"status" must be one of [active, inactive, out-of-stock]',
    }),

});

module.exports = productSchema;
