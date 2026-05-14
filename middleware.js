export const isLoggedin=(req,res,next)=>{
    if (!req.isAuthenticated()) {
        req.session.returnTo=req.originalUrl
        req.flash('error', 'you must be signed in first!');
        return res.redirect('/login');
    }
    next()
}

export const storeReturnTo = (req, res, next) => {
    if (req.session.returnTo) {
        res.locals.returnTo = req.session.returnTo;
    }
    next();
}