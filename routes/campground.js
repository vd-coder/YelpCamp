const express = require("express");
const Campground = require("../models/campground");
const Review = require("../models/review");
const appError = require("../utilis/appError");
const joi = require("joi");
const router = express.Router();
const middleware = require("../middleware");
const { findByIdAndUpdate } = require("../models/review");
const wrapAsync = (fn) => {
  return function (req, res, next) {
    fn(req, res, next).catch((e) => next(e));
  };
};

const validateSchema = (req, res, next) => {
  const validatorSchema = joi.object({
    campground: joi
      .object({
        title: joi.string().required(),
        price: joi.number().required().min(0),
        image: joi.string().required(),
        location: joi.string().required(),
        description: joi.string().required(),
      })
      .required(),
  });

  const result = validatorSchema.validate(req.body);
  if (result.error) {
    const msg = result.error.details.map((el) => el.message).join(",");
    throw new appError(msg, 400);
  } else {
    next();
  }
};

router.get(
  "/",
  wrapAsync(async (req, res, next) => {
    const campgrounds = await Campground.find({});
    res.render("campgrounds/index", { campgrounds });
  })
);
router.get("/new", middleware, (req, res) => {
  if (!req.isAuthenticated()) {
    res.redirect("/login");
  } else res.render("campgrounds/new");
});

router.post(
  "/",
  middleware,
  validateSchema,
  wrapAsync(async (req, res, next) => {
    const campground = new Campground(req.body.campground);
    campground.author=req.user._id;
    await campground.save();

    res.redirect(`/campgrounds/${campground._id}`);
  })
);

router.get(
  "/:id",
  wrapAsync(async (req, res, next) => {
    const campground = await Campground.findById(req.params.id).populate({
      path:'reviews',
      populate:{
        path:'author'
      }
    }).populate('author');
    // console.log(campground);
    res.render("campgrounds/show", { campground });
  })
);

router.get(
  "/:id/edit",
  middleware,

  wrapAsync(async (req, res, next) => {
    const campground = await Campground.findById(req.params.id);
    res.render("campgrounds/edit", { campground });
  })
);

router.put(
  "/:id",
  middleware,
  validateSchema,
  wrapAsync(async (req, res, next) => {
    const { id } = req.params;
    // console.log(req.body);
    // console.log(req.user);
    
    const campground = await Campground.findById(id);
    // console.log(campground.author);
    if(campground.author.equals(req.user._id))
    {
      console.log(req.body);
      const cmp=await Campground.findByIdAndUpdate(id,req.body.campground)
      res.redirect(`/campgrounds/${campground._id}`);
    }
    else
    {
      res.redirect('/campgrounds');
    // const cmp=findByIdAndUpdate(id,{...req.body})
    // res.redirect(`/campgrounds/${campground._id}`);
    }
  })
);

router.delete(
  "/:id",
  middleware,
  wrapAsync(async (req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    
    if(!campground.author.equals(req.user._id))
    {
      res.redirect('/campgrounds');
    }

    else{
    for (let review of campground.reviews) {
      await Review.findByIdAndDelete(review);
    }
    await Campground.deleteOne(campground);
    res.redirect("/campgrounds");
  }
  })
);

module.exports = router;
