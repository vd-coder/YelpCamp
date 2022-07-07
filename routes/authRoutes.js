const express = require("express");
const router = express.Router();
const User = require("../models/Users");
const passport = require("passport");
const wrapAsync = (fn) => {
  return function (req, res, next) {
    fn(req, res, next).catch((e) => next(e));
  };
};

router.get("/register", (req, res) => {
  res.render("users/register");
});

router.post("/register", async (req, res) => {
  const email = req.body.email;
  const userName = req.body.username;
  const password = req.body.password;

  const newUser = new User({ email, username: userName });
  //   res.send(userName);
  const registeredUser = await User.register(newUser, password);

  res.redirect("/campgrounds");
});

router.get("/login", async (req, res) => {
  res.render("users/login");
});

router.post(
  "/login",
  passport.authenticate("local", {
    failureRedirect: "/login",
  }),

  async (req, res) => {
    res.redirect("/campgrounds");
  }
);

router.get("/logout", (req, res) => {
  req.logout(() => {});
  res.redirect("/campgrounds");
});

module.exports = router;
