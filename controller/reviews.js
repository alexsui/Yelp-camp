const Campground=require('../models/campground');
const Review=require('../models/review');

module.exports.createReviews=async(req,res)=>{
    const campground=await Campground.findById(req.params.id);
    const review=await new Review(req.body.review);
    campground.reviews.push(review);
    review.author=req.user._id;
    await campground.save();
    await review.save();
    req.flash("success","Successfully created reviews!!");
    res.redirect(`/campgrounds/${req.params.id}`);
 }
 module.exports.deleteReviews=async(req,res)=>{
    const{ id,reviewId}=req.params;
    await Campground.findByIdAndUpdate(id,{$pull:{reviews:reviewId}});
    await Review.findByIdAndDelete(reviewId);
    req.flash("success","Successfully deleted reviews!!");
    res.redirect(`/campgrounds/${id}`);
}