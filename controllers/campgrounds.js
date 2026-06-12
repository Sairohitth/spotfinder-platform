import { Campground } from '../models/campground.js'
import { cloudinary } from '../cloudinary/index.js';

export const index = async (req, res) => {
    const { search = '', sort = 'newest', minPrice = '', maxPrice = '' } = req.query;
    const trimmedSearch = search.trim();
    const trimmedMinPrice = minPrice.trim();
    const trimmedMaxPrice = maxPrice.trim();
    const minPriceNumber = Number(trimmedMinPrice);
    const maxPriceNumber = Number(trimmedMaxPrice);
    const sortOptions = {
        newest: { _id: -1 },
        price_asc: { price: 1 },
        price_desc: { price: -1 }
    };
    const selectedSort = sortOptions[sort] ? sort : 'newest';
    const query = trimmedSearch
        ? {
            $or: [
                { title: { $regex: trimmedSearch, $options: 'i' } },
                { location: { $regex: trimmedSearch, $options: 'i' } }
            ]
        }
        : {};
    if (trimmedMinPrice || trimmedMaxPrice) {
        query.price = {};
        if (trimmedMinPrice && !Number.isNaN(minPriceNumber)) {
            query.price.$gte = minPriceNumber;
        }
        if (trimmedMaxPrice && !Number.isNaN(maxPriceNumber)) {
            query.price.$lte = maxPriceNumber;
        }
        if (Object.keys(query.price).length === 0) {
            delete query.price;
        }
    }
    const campgrounds = await Campground.find(query)
        .populate({ path: 'reviews', select: 'rating' })
        .sort(sortOptions[selectedSort]);
    res.render('campgrounds/index', {
        campgrounds,
        search: trimmedSearch,
        sort: selectedSort,
        minPrice: trimmedMinPrice,
        maxPrice: trimmedMaxPrice
    })
}

export const renderNewForm=(req,res)=>{
    res.render('campgrounds/new')
}

export const myListings = async (req, res) => {
    const campgrounds = await Campground.find({ author: req.user._id })
        .populate({ path: 'reviews', select: 'rating' })
        .sort({ _id: -1 });
    res.render('campgrounds/my-listings', { campgrounds });
}

export const createCampground=async(req,res,next)=>{
    const campground=new Campground(req.body.campground)
    campground.images=req.files.map(f=>({url:f.path,filename:f.filename}))
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
    // console.log(req.body)
    const campground=await Campground.findByIdAndUpdate(id,{...req.body.campground})
    const imgs=req.files.map(f=>({url:f.path,filename:f.filename}))
    campground.images.push(...imgs)
    await campground.save()
    if(req.body.deleteImages){
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await campground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } });
    }
    req.flash('success','Successfully updated campground!')
    res.redirect(`/campgrounds/${campground._id}`)
}

export const deleteCampground =async (req,res)=>{
    const {id} =req.params
    await Campground.findByIdAndDelete(id)
    req.flash('success','Successfully deleted campground!')
    res.redirect('/campgrounds')
}
