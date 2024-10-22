const Joi = require("joi");

const addressSchema = Joi.object({
  firstName: Joi.string().max(50).required().messages({
    "any.required": "First name is required.",
    "string.empty": "First name cannot be empty.",
    "string.max": "First name cannot exceed 50 characters.",
  }),

  lastName: Joi.string().max(50).required().messages({
    "any.required": "Last name is required.",
    "string.empty": "Last name cannot be empty.",
    "string.max": "Last name cannot exceed 50 characters.",
  }),

  buildingName: Joi.string().max(100).required().messages({
    "any.required": "Building name is required.",
    "string.empty": "Building name cannot be empty.",
    "string.max": "Building name cannot exceed 100 characters.",
  }),

  landmark: Joi.string().max(100).optional().allow("").messages({
    "string.max": "Landmark cannot exceed 100 characters.",
  }),

  street: Joi.string().trim().max(100).required().messages({
    "any.required": "Street is required.",
    "string.empty": "Street cannot be empty.",
    "string.max": "Street cannot exceed 100 characters.",
  }),

  city: Joi.string().trim().max(50).required().messages({
    "any.required": "City is required.",
    "string.empty": "City cannot be empty.",
    "string.max": "City cannot exceed 50 characters.",
  }),

  state: Joi.string().trim().max(10).required().messages({
    "any.required": "State is required.",
    "string.empty": "State cannot be empty.",
    "string.max": "State cannot exceed 10 characters.",
  }),

  postalCode: Joi.string().trim().length(6).required().messages({
    "any.required": "Postal code is required.",
    "string.empty": "Postal code cannot be empty.",
    "string.length": "Postal code must be exactly 6 characters.",
  }),

  country: Joi.string().trim().max(50).required().messages({
    "any.required": "Country is required.",
    "string.empty": "Country cannot be empty.",
    "string.max": "Country cannot exceed 50 characters.",
  }),

  isDefault: Joi.boolean().default(false),

  phone: Joi.string()
    .optional()
    .allow("")
    .regex(/^\d{10,}$/)
    .messages({
      "string.pattern.base": "Phone number must be at least 10 digits.",
    }),
});

module.exports = addressSchema;
