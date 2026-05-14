import express from 'express'
const router = express.Router()
import { User } from '../models/user.js'
import { catchAsync } from '../utils/catchAsync.js'
import passport from 'passport'
import { storeReturnTo } from '../middleware.js'

router.get('/register',(req,res)=>{
    res.render('users/register')
})

router.post('/register',catchAsync(async(req,res,next)=>{
    try{
        const {email,username,password}=req.body
        const user=new User({email,username})
        const registeredUser=await User.register(user,password)
        req.login(registeredUser,err=>{
            if(err) return next(err)
            req.flash('success',"Welcome to yelpcamp")
            res.redirect('/campgrounds')
        })
    }catch(e){
        req.flash('error',e.message)
        res.redirect('register')
    }    
}))

router.get('/login',(req,res)=>{
    res.render('users/login')
})

router.post('/login',storeReturnTo,passport.authenticate('local',{failureFlash:true, failureRedirect:'/login'}),(req,res)=>{
    req.flash('success',"Welcome Back")
    const redirectUrl = res.locals.returnTo || '/campgrounds'
    res.redirect(redirectUrl)
})

router.get('/logout',(req,res)=>{
    req.logout(function (err) {
        if (err) {
            return next(err);
        }
        req.flash('success', 'Goodbye!');
        res.redirect('/campgrounds');
    });
})

export default router