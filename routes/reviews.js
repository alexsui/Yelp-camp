const express=require("express");

const Campground=require("../models/campground");
const catchAsync=require("../utils/catchAsync");
const ExpressError=require("../utils/ExpressError");
const Joi = require('joi');
const router=express.Router({mergeParams:true});
const{reviewSchema}=require("../schemas");
const Review=require("../models/review");
const{validateReview,isLoginIn,isReviewAuthor}=require("../middleware");
const Reviews=require('../controller/reviews');


router.post("/",isLoginIn,validateReview,catchAsync(Reviews.createReviews));
router.delete("/:reviewId",isLoginIn,isReviewAuthor,catchAsync(Reviews.deleteReviews));
 module.exports=router;