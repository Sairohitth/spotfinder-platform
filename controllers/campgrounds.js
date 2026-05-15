import { Campground } from '../models/campground.js'

export const index = async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds })
}

export const renderNewForm=(req,res)=>{
    res.render('campgrounds/new')
}

export const createCampground=async(req,res,next)=>{
    const campground=new Campground(req.body.campground)
    campground.author=req.user._id
    await campground.save();
    req.flash('success',"Successfully made a new campground!")
    res.redirect(`/campgrounds/${campground._id}`)
}

export const showCampground=async(req,res)=>{
    const campground=await Campground.findById(req.params.id).populate({
    path:'reviews',
    populate:{
        path:'author'
    }
    }).populate('author')
    if(!campground){
        req.flash('error','Cannot find that campground')
        return res.redirect('/campgrounds')
    }
    res.render('campgrounds/show',{campground})
}


export const renderEditForm=async(req,res)=>{
    const { id } = req.params;
    const campground = await Campground.findById(id)
    if (!campground) {
        req.flash('error', 'Cannot find that campground!');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit', { campground });
}

export const updateCampground = async (req,res)=>{
    const {id} =req.params
    const campground=await Campground.findByIdAndUpdate(id,{...req.body.campground})
    req.flash('success','Successfully updated campground!')
    res.redirect(`/campgrounds/${campground._id}`)
}

export const deleteCampground =async (req,res)=>{
    const {id} =req.params
    await Campground.findByIdAndDelete(id)
    req.flash('success','Successfully deleted campground!')
    res.redirect('/campgrounds')
}