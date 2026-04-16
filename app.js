import express from 'express'
import mongoose from 'mongoose'
import { Campground } from './models/campground.js'
import methodOverride from 'method-override'
import ejsMate from 'ejs-mate'
import {catchAsync} from './utils/catchAsync.js'
import { ExpressError } from './utils/ExpressError.js'
import {campgroundSchema, reviewSchema} from './schemas.js'
import { Review } from './models/review.js'

const app=express()

mongoose.connect('mongodb://127.0.0.1:27017/spot-finder')
.then(()=>{
    console.log("Database Connected")
})
.catch((err)=>{
    console.log("DB ERROR",err);
})

app.set('view engine','ejs')
app.set('views','views')
app.use(express.urlencoded({extended:true}))
app.use(methodOverride('_method'))
app.engine('ejs', ejsMate);


const validateCampground=(req,res,next)=>{
    const {error}=campgroundSchema.validate(req.body)
    if(error){
        const msg=error.details.map(ele=>ele.message).join(',')
        throw new ExpressError(msg,404);
    }else{
        next()
    }
}

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


app.get('/',(req,res)=>{
    res.render('home')
})

app.get('/campgrounds',async (req,res)=>{
    const campgrounds=await Campground.find({});
    res.render('campgrounds/index',{campgrounds})
})

app.get('/campgrounds/new',(req,res)=>{
    res.render('campgrounds/new')
})

app.post('/campgrounds',validateCampground,catchAsync(async(req,res,next)=>{
    // if(!req.body.campground) throw new ExpressError("Invalid campground data",400)
    const campground=new Campground(req.body.campground)
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`)
}))

app.get('/campgrounds/:id',catchAsync(async(req,res)=>{
    const campground=await Campground.findById(req.params.id).populate('reviews')
    res.render('campgrounds/show',{campground})
}))

app.get('/campgrounds/:id/edit',catchAsync(async(req,res)=>{
    const campground=await Campground.findById(req.params.id)
    res.render('campgrounds/edit',{campground})
}))

app.put('/campgrounds/:id',validateCampground,catchAsync(async (req,res)=>{
    const {id} =req.params
    const campground=await Campground.findByIdAndUpdate(id,{...req.body.campground})
    res.redirect(`/campgrounds/${campground._id}`)
}))

app.delete('/campgrounds/:id',catchAsync(async (req,res)=>{
    const {id} =req.params
    await Campground.findByIdAndDelete(id)
    res.redirect('/campgrounds')
}))

app.post('/campgrounds/:id/reviews',validateReview,catchAsync(async(req,res)=>{
    const campground=await Campground.findById(req.params.id);
    const review=new Review(req.body.review)
    campground.reviews.push(review)
    await review.save();
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`)
}))

app.delete('/campgrounds/:id/reviews/:reviewId',catchAsync(async (req,res)=>{
    const {id,reviewId} =req.params;
    Campground.findByIdAndUpdate(id,{$pull:{reviews:reviewId}})
    const review=await Review.findByIdAndDelete(reviewId);
    res.redirect(`/campgrounds/${id}`)
}))

app.all('/{*path}',(req,res,next)=>{
    next(new ExpressError("Page not found",404))
})

app.use((err,req,res,next)=>{
    const {statusCode=500}=err
    if(!err.message) err.message='Oh No, Something went wrong!'
    res.status(statusCode).render('error',{err})
})

app.listen(3000,()=>{
    console.log("Serving on port 3000");
})