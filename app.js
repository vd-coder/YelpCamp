const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const ejsMate = require("ejs-mate");
const methodOverride = require("method-override");
const Campground = require("./models/campground");
const Review = require("./models/review");
const User = require("./models/Users");
const appError = require("./utilis/appError");
const joi = require("joi");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const campgroundRoutes = require("./routes/campground");
const reviewRoutes = require("./routes/review");
const authRoutes = require("./routes/authRoutes");
const session = require("express-session");
mongoose.connect("mongodb://localhost:27017/yelp-camp", {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Database connected");
});

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
const sessiomConfig = {
  secret: "my secret!!!",
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    expires: Date.now() + 7 * 24 * 3600 * 1000,
    maxage: 7 * 24 * 3600 * 1000,
  },
};

app.use(session(sessiomConfig));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  // console.log(req.user);
  next();
});
app.use(express.static(path.join(__dirname, "public")));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/reviews", reviewRoutes);
app.use("/", authRoutes);
app.get("/", (req, res) => {
  res.render("home");
});
app.all("*", (req, res) => {
  throw new appError("Not Found", 401);
});
app.use((err, req, res, next) => {
  const status = err.status || 500;
  const msg = err.message || "There is some error";
  err.message = msg;
  err.status = status;
  res.status(status).render("error", { err });
});
app.listen(3000, () => {
  console.log("Serving on port 3000");
});
