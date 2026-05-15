import express from 'express'
const router=express.Router({mergeParams:true})
import {catchAsync} from '../utils/catchAsync.js'
import { Campground } from '../models/campground.js'
import { Review } from '../models/review.js'
import { ExpressError } from '../utils/ExpressError.js'
import { validateReview, isLoggedin, isReviewAuthor } from '../middleware.js'



router.post('/',isLoggedin,validateReview,catchAsync(async(req,res)=>{
    const campground=await Campground.findById(req.params.id);
    const review=new Review(req.body.review)
    review.author=req.user._id;
    campground.reviews.push(review)
    await review.save();
    await campground.save();
    req.flash('success','Created new Review!')
    res.redirect(`/campgrounds/${campground._id}`)
}))

router.delete('/:reviewId',isLoggedin,isReviewAuthor,catchAsync(async (req,res)=>{
    const {id,reviewId} =req.params;
    Campground.findByIdAndUpdate(id,{$pull:{reviews:reviewId}})
    const review=await Review.findByIdAndDelete(reviewId);
    req.flash('success','Successfully deleted review!')
    res.redirect(`/campgrounds/${id}`)
}))

export default router