import express from 'express'
const router=express.Router()
import {catchAsync} from '../utils/catchAsync.js'
import { ExpressError } from '../utils/ExpressError.js'
import { Campground } from '../models/campground.js'
import {campgroundSchema} from '../schemas.js'
import { isLoggedin } from '../middleware.js'

const validateCampground=(req,res,next)=>{
    const {error}=campgroundSchema.validate(req.body)
    if(error){
        const msg=error.details.map(ele=>ele.message).join(',')
        throw new ExpressError(msg,404);
    }else{
        next()
    }
}

router.get('/',async (req,res)=>{
    const campgrounds=await Campground.find({});
    res.render('campgrounds/index',{campgrounds})
})

router.get('/new',isLoggedin,(req,res)=>{
    res.render('campgrounds/new')
})

router.post('/',isLoggedin,validateCampground,catchAsync(async(req,res,next)=>{
    // if(!req.body.campground) throw new ExpressError("Invalid campground data",400)
    const campground=new Campground(req.body.campground)
    await campground.save();
    req.flash('success',"Successfully made a new campground!")
    res.redirect(`/campgrounds/${campground._id}`)
}))

router.get('/:id',catchAsync(async(req,res)=>{
    const campground=await Campground.findById(req.params.id).populate('reviews')
    if(!campground){
        req.flash('error','Cannot find that campground')
        return res.redirect('/campgrounds')
    }
    res.render('campgrounds/show',{campground})
}))

router.get('/:id/edit',isLoggedin,catchAsync(async(req,res)=>{
    const campground=await Campground.findById(req.params.id)
    res.render('campgrounds/edit',{campground})
}))

router.put('/:id',isLoggedin,validateCampground,catchAsync(async (req,res)=>{
    const {id} =req.params
    const campground=await Campground.findByIdAndUpdate(id,{...req.body.campground})
    req.flash('success','Successfully updated campground!')
    res.redirect(`/campgrounds/${campground._id}`)
}))

router.delete('/:id',isLoggedin,catchAsync(async (req,res)=>{
    const {id} =req.params
    await Campground.findByIdAndDelete(id)
    req.flash('success','Successfully deleted campground!')
    res.redirect('/campgrounds')
}))

export default router;