import { User } from '../models/user.js'

export const renderRegister=(req,res)=>{
    res.render('users/register')
}

export const register=async(req,res,next)=>{
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
}

export const renderLogin=(req,res)=>{
    res.render('users/login')
}

export const login=(req,res)=>{
    req.flash('success',"Welcome Back")
    const redirectUrl = res.locals.returnTo || '/campgrounds'
    res.redirect(redirectUrl)
}

export const logout=(req,res)=>{
    req.logout(function (err) {
        if (err) {
            return next(err);
        }
        req.flash('success', 'Goodbye!');
        res.redirect('/campgrounds');
    });
}