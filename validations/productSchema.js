const Joi = require('joi');

const productSchema = Joi.object({
  name: Joi.string()
    .trim()
    .required()
    .messages({
      'string.base': '"name" should be a type of string',
      'string.empty': '"name" cannot be an empty field',
      'any.required': '"name" is a required field'
    }),
  
  description: Joi.string()
    .trim()
    .required()
    .messages({
      'string.base': '"description" should be a type of string',
      'string.empty': '"description" cannot be an empty field',
      'any.required': '"description" is a required field'
    }),
  
  category: Joi.string()
    .required()
    .messages({
      'any.required': '"category" is a required field'
    }),
  
  brand: Joi.string()
    .trim()
    .optional()
    .messages({
      'string.base': '"brand" should be a type of string'
    }),
  
  sku: Joi.string()
    .required()
    .messages({
      'any.required': '"sku" is a required field'
    }),
  
  price: Joi.number()
    .required()
    .messages({
      'any.required': '"price" is a required field',
      'number.base': '"price" should be a type of number'
    }),
  
  discountPrice: Joi.number()
    .optional()
    .default(0)
    .messages({
      'number.base': '"discountPrice" should be a type of number'
    }),
  
  stock: Joi.number()
    .min(0)
    .required()
    .messages({
      'any.required': '"stock" is a required field',
      'number.base': '"stock" should be a type of number',
      'number.min': '"stock" must be at least 0'
    }),
  
  images: Joi.array()
    .items(
      Joi.object({
        url: Joi.string().uri().required()
          .messages({
            'string.base': '"url" should be a type of string',
            'string.empty': '"url" cannot be an empty field',
            'any.required': '"url" is a required field'
          }),
        alt: Joi.string().optional()
          .messages({
            'string.base': '"alt" should be a type of string'
          })
      })
    )
    .optional()
    .messages({
      'array.base': '"images" should be an array'
    }),
  
  isFeatured: Joi.boolean()
    .default(false)
    .messages({
      'boolean.base': '"isFeatured" should be a boolean'
    }),
  
  status: Joi.string()
    .valid('active', 'inactive', 'out-of-stock')
    .default('active')
    .messages({
      'string.base': '"status" should be a type of string',
      'any.only': '"status" must be one of [active, inactive, out-of-stock]'
    }),
  
  tags: Joi.array()
    .items(Joi.string())
    .optional()
    .messages({
      'array.base': '"tags" should be an array'
    }),
  
  shipping: Joi.object({
    freeShipping: Joi.boolean()
      .default(false)
      .messages({
        'boolean.base': '"freeShipping" should be a boolean'
      }),
    shippingCost: Joi.number()
      .optional()
      .default(0)
      .messages({
        'number.base': '"shippingCost" should be a type of number'
      })
  }).optional()
});

module.exports = productSchema;
