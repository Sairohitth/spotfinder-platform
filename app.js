import express from 'express'
import mongoose from 'mongoose'
import ejsMate from 'ejs-mate'
import { ExpressError } from './utils/ExpressError.js'
import methodOverride from 'method-override'
import session from 'express-session'
import flash from 'connect-flash'
import passport from 'passport'
import LocalStrategy from 'passport-local'
import {User} from './models/user.js'

import campgroundRoutes from './routes/campgrounds.js'
import reviewRoutes from './routes/reviews.js'
import userRoutes from './routes/users.js'

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
app.engine('ejs', ejsMate);

const sessionConfig={
    secret:'asecret!',
    resave:false,
    saveUninitialized:true,
    cookie:{
        httpOnly:true,
        expires:Date.now()+1000*60*60*24*7,
        maxAge:1000*60*60*24*7
    }
}
app.use(express.urlencoded({extended:true}))
app.use(methodOverride('_method'))
app.use(express.static('public'))

app.use(session(sessionConfig))
app.use(flash())
app.use(passport.initialize())
app.use(passport.session())
passport.use(new LocalStrategy(User.authenticate()))
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

app.use((req,res,next)=>{
    console.log(req.session)
    res.locals.currentUser=req.user
    res.locals.success=req.flash('success')
    res.locals.error=req.flash('error')
    next()
})





app.use('/campgrounds',campgroundRoutes)
app.use('/campgrounds/:id/reviews',reviewRoutes)
app.use('/',userRoutes)



app.get('/',(req,res)=>{
    res.render('home')
})

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