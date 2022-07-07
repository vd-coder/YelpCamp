const mongoose = require("mongoose");
const User=require('./Users');
const reviewSchema = new mongoose.Schema({
  body: String,
  rating: Number,
  author:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'User'
  }
});

module.exports = mongoose.model("Review", reviewSchema);
