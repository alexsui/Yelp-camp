const User=require("../models/user");
const Campground=require("../models/campground");

module.exports.renderRegisterForm=(req,res)=>{
    res.render("users/register");
}
module.exports.register=async(req,res)=>{
    try{
        const{email,username,password}=req.body;
        const user=new User({username,email});
        const newUser=await User.register(user,password);
        req.login(newUser,(err)=>{
            if(err) return next(err);
            req.flash('success','Successfully register!!!!!!');
            res.redirect("/campgrounds");
    })    
    }catch(e){
        console.log(e);
        req.flash('error',e.message);
        res.redirect("/register");
    }   
}
module.exports.renderLogin=(req,res)=>{
    res.render('users/login');
}
module.exports.login=(req,res)=>{
    req.flash('success','Welcome Back');
    const redirectUrl=req.session.returnTo ||"/campgrounds";
    res.redirect(redirectUrl);
}
module.exports.logout=(req,res)=>{
    req.logOut();
    req.flash('success','Good Bye!!');
    res.redirect("/campgrounds");
}