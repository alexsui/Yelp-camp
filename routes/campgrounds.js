const express=require("express");
const mongoose=require("mongoose");
const Campground=require("../models/campground");
const catchAsync=require("../utils/catchAsync");
const ExpressError=require("../utils/ExpressError");
const Joi = require('joi');
const router=express.Router();
const campgrounds=require('../controller/campgrounds');


const {isLoginIn,isAuthor,validateCampground}=require('../middleware');
const multer=require("multer");
const{storage}=require("../cloudinary");
const upload=multer({storage});



router.route('/')
    .get(campgrounds.index)
    .post(isLoginIn,upload.array('image'),validateCampground,catchAsync(campgrounds.createCampgrounds))
   
router.get("/new",isLoginIn,campgrounds.renderNewForm);

router.route('/:id')
    .get(campgrounds.showCampgrounds)
    .put(isLoginIn,isAuthor,upload.array('image'),validateCampground,catchAsync(campgrounds.updateCampgrounds))
    .delete(isLoginIn,isAuthor,campgrounds.deleteCampgrounds);

router.get("/:id/edit",isLoginIn,isAuthor,campgrounds.renderEditForm);

module.exports=router;