const express=require('express');
const passport = require('passport');
const app=express();
const router=express.Router();
const User=require("../models/user");
const catchAsync=require("../utils/catchAsync");
const Users=require("../controller/users");

app.use(express.urlencoded({extended:true}));

router.route("/register")
    .get(Users.renderRegisterForm)
    .post(catchAsync(Users.register));
router.route('/login')
    .get(Users.renderLogin)
    .post(passport.authenticate('local',{failureRedirect:'/login',failureFlash:true}),Users.login)
    
router.get('/logout',Users.logout)
module.exports=router;