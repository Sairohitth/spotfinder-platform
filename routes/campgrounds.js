import express from 'express'
const router=express.Router()
import {catchAsync} from '../utils/catchAsync.js'
import { Campground } from '../models/campground.js'
import { isLoggedin, validateCampground, isAuthor } from '../middleware.js'


router.get('/',catchAsync(async (req,res)=>{
    const campgrounds=await Campground.find({});
    res.render('campgrounds/index',{campgrounds})
}))

router.get('/new',isLoggedin,(req,res)=>{
    res.render('campgrounds/new')
})

router.post('/',isLoggedin,validateCampground,catchAsync(async(req,res,next)=>{
    const campground=new Campground(req.body.campground)
    campground.author=req.user._id
    await campground.save();
    req.flash('success',"Successfully made a new campground!")
    res.redirect(`/campgrounds/${campground._id}`)
}))

router.get('/:id',catchAsync(async(req,res)=>{
    const campground=await Campground.findById(req.params.id).populate({
    path:'reviews',
    populate:{
        path:'author'
    }
    }).populate('author')
    console.log(campground)
    if(!campground){
        req.flash('error','Cannot find that campground')
        return res.redirect('/campgrounds')
    }
    res.render('campgrounds/show',{campground})
}))

router.get('/:id/edit', isLoggedin, isAuthor, catchAsync(async(req,res)=>{
    const { id } = req.params;
    const campground = await Campground.findById(id)
    if (!campground) {
        req.flash('error', 'Cannot find that campground!');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit', { campground });
}))

router.put('/:id',isLoggedin,isAuthor,validateCampground,catchAsync(async (req,res)=>{
    const {id} =req.params
    const campground=await Campground.findByIdAndUpdate(id,{...req.body.campground})
    req.flash('success','Successfully updated campground!')
    res.redirect(`/campgrounds/${campground._id}`)
}))

router.delete('/:id',isLoggedin,isAuthor,catchAsync(async (req,res)=>{
    const {id} =req.params
    await Campground.findByIdAndDelete(id)
    req.flash('success','Successfully deleted campground!')
    res.redirect('/campgrounds')
}))

export default router;