const joi = require("joi");

module.exports.listingSchema = joi.object({
  listing: joi
    .object({
      title: joi.string().required(),
      description: joi.string().required(),
      price: joi.number().required().min(0),
      location: joi.string().required(),
      country: joi.string().required(),
      category: joi.string().required(),
      state: joi.string()
    })
    .required(),
});

module.exports.placeSchema = joi.object({
  place: joi
    .object({
      place_name: joi.string().required(),
      description: joi.string().required(),
      country: joi.string().required(),
      location: joi.string().required(),
      type: joi.string().required(),
      state: joi.string()
    })
    .required(),
});

module.exports.localShopSchema = joi.object({
  shop: joi
    .object({
      name: joi.string().required(),
      description: joi.string().required(),
      country: joi.string().required(),
      location: joi.string().required(),
      category: joi.string().required(),
      state: joi.string()
    })
    .required(),
});

module.exports.reviewSchema = joi.object({
  review: joi.object({
    rating: joi.number().required().min(1).max(5),
    comment: joi.string().required()
  }).required()
})