const Joi = require("joi");

const userRegisterSchema = Joi.object({
  firstname: Joi.string().alphanum().min(3).max(15).required().messages({
    "string.alphanum": "First name must only contain letters and numbers.",
    "string.min": "First name must be at least 3 characters long.",
    "string.max": "First name must be at most 15 characters long.",
    "any.required": "First name is required.",
  }),
  lastname: Joi.string().alphanum().min(3).max(15).required().messages({
    "string.alphanum": "Last name must only contain letters and numbers.",
    "string.min": "Last name must be at least 3 characters long.",
    "string.max": "Last name must be at most 15 characters long.",
    "any.required": "Last name is required.",
  }),
  password: Joi.string().min(6).required().messages({
    "string.min": "Password must be at least 6 characters long.",
    "any.required": "Password is required.",
  }),
  email: Joi.string().email().required().messages({
    "string.email": "Email must be a valid email address.",
    "any.required": "Email is required.",
  }),
  phone: Joi.string()
    .pattern(/^[0-9]{10}$/)
    .required().messages({
        'string.pattern.base': 'Phone number must be exactly 10 digits long.',
        'any.required': 'Phone number is required.',
      }),
});

module.exports = { userRegisterSchema };

// ^:This means the match must occur at the beginning of the string.
// [0-9]: This defines a character class that matches any digit from 0 to 9.
// {10}: Specifies that exactly 10 digits must be matched. The number in curly braces {} indicates how many times the preceding element (in this case, any digit) should appear.
// $: Asserts the end of the string. This means that after the 10 digits, there should be nothing else in the string.
