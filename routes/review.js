const express = require("express");
const Campground = require("../models/campground");
const appError = require("../utilis/appError");
const joi = require("joi");
const router = express.Router({ mergeParams: true });
const Review = require("../models/review");
const middleware=require('../middleware');
// const Campground = require("../models/campground");
const wrapAsync = (fn) => {
  return function (req, res, next) {
    fn(req, res, next).catch((e) => next(e));
  };
};

const reviewSchemaValidator = (req, res, next) => {
  const reviewSchema = joi.object({
    review: joi
      .object({
        body: joi.string().required(),
        rating: joi.number().required().min(1).max(5),
      })
      .required(),
  });
  const result = reviewSchema.validate(req.body);
  if (result.error) {
    const msg = result.error.details.map((el) => el.message).join(",");
    throw new appError(msg, 400);
  } else {
    next();
  }
};

router.post(
  "/",
  reviewSchemaValidator,middleware,
  wrapAsync(async (req, res) => {
    const id = req.params.id;
    const review = new Review(req.body.review);
    review.author=req.user._id;
    // console.dir(req.params);
    const campground = await Campground.findById(id);

    // res.send(campground);
    // console.dir(campground1);
    campground.reviews.push(review);
    // console.dir(id);
    await campground.save();
    await review.save();
    res.redirect(`/campgrounds/${id}`);
  })
);
router.delete(
  "/:reviewid",middleware,
  wrapAsync(async (req, res) => {
    
    const id = req.params.id;
    const reviewId = req.params.reviewId;
    const review=await Review.findById(reviewId);
    if(!review.author.equals(req.user._id))
    {
      res.redirect('/campgrounds');
    }
    else{
    await Review.findByIdAndDelete(reviewId);
    const campground = await Campground.findById(id);
    //   console.log(campground.reviews);
    campground.reviews.splice(campground.reviews.indexOf(reviewId));
    await campground.save();
    res.redirect(`/campgrounds/${id}`);
    }
  })
);

module.exports = router;
