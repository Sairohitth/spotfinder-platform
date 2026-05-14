import express from 'express'
const router=express.Router({mergeParams:true})

import {catchAsync} from '../utils/catchAsync.js'
import { Campground } from '../models/campground.js'
import { Review } from '../models/review.js'
import { ExpressError } from '../utils/ExpressError.js'
import {reviewSchema} from '../schemas.js'


const validateReview=(req,res,next)=>{
    const {error} = reviewSchema.validate(req.body);
    console.log(error)
    if(error){
        const msg=error.details.map(ele=>ele.message).join(',')
        throw new ExpressError(msg,404);
    }else{
        next()
    }
}

router.post('/',validateReview,catchAsync(async(req,res)=>{
    const campground=await Campground.findById(req.params.id);
    const review=new Review(req.body.review)
    campground.reviews.push(review)
    await review.save();
    await campground.save();
    req.flash('success','Created new Review!')
    res.redirect(`/campgrounds/${campground._id}`)
}))

router.delete('/:reviewId',catchAsync(async (req,res)=>{
    const {id,reviewId} =req.params;
    Campground.findByIdAndUpdate(id,{$pull:{reviews:reviewId}})
    const review=await Review.findByIdAndDelete(reviewId);
    req.flash('success','Successfully deleted review!')
    res.redirect(`/campgrounds/${id}`)
}))

export default router