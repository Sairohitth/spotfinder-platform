import express from 'express'
import mongoose from 'mongoose'
import { Campground } from './models/campground.js'
import methodOverride from 'method-override'
import ejsMate from 'ejs-mate'
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

app.post('/campgrounds',async(req,res)=>{
    const campground=new Campground(req.body.campground)
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`)
})

app.get('/campgrounds/:id',async(req,res)=>{
    const campground=await Campground.findById(req.params.id)
    res.render('campgrounds/show',{campground})
})

app.get('/campgrounds/:id/edit',async(req,res)=>{
    const campground=await Campground.findById(req.params.id)
    res.render('campgrounds/edit',{campground})
})

app.put('/campgrounds/:id',async (req,res)=>{
    const {id} =req.params
    const campground=await Campground.findByIdAndUpdate(id,{...req.body.campground})
    res.redirect(`/campgrounds/${campground._id}`)
})

app.delete('/campgrounds/:id',async (req,res)=>{
    const {id} =req.params
    await Campground.findByIdAndDelete(id)
    res.redirect('/campgrounds')
})

app.listen(3000,()=>{
    console.log("Serving on port 3000");
})