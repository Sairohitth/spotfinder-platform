import { Campground } from '../models/campground.js'
import { cloudinary } from '../cloudinary/index.js';

export const index = async (req, res) => {
    const { search = '', sort = 'newest', minPrice = '', maxPrice = '', page = '1' } = req.query;
    const trimmedSearch = search.trim();
    const trimmedMinPrice = minPrice.trim();
    const trimmedMaxPrice = maxPrice.trim();
    const minPriceNumber = Number(trimmedMinPrice);
    const maxPriceNumber = Number(trimmedMaxPrice);
    const limit = 6;
    const requestedPage = Number.parseInt(page, 10);
    let currentPage = Number.isNaN(requestedPage) || requestedPage < 1 ? 1 : requestedPage;
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
    const totalCampgrounds = await Campground.countDocuments(query);
    const totalPages = Math.ceil(totalCampgrounds / limit) || 1;
    if (currentPage > totalPages) {
        currentPage = totalPages;
    }
    const campgrounds = await Campground.find(query)
        .populate({ path: 'reviews', select: 'rating' })
        .sort(sortOptions[selectedSort])
        .skip((currentPage - 1) * limit)
        .limit(limit);
    res.render('campgrounds/index', {
        campgrounds,
        search: trimmedSearch,
        sort: selectedSort,
        minPrice: trimmedMinPrice,
        maxPrice: trimmedMaxPrice,
        currentPage,
        totalPages
    })
}

export const renderNewForm=(req,res)=>{
    res.render('campgrounds/new')
}

export const myListings = async (req, res) => {
    const campgrounds = await Campground.find({ author: req.user._id })
        .populate({ path: 'reviews', select: 'rating' })
        .sort({ _id: -1 });
    const totalCampgrounds = campgrounds.length;
    const numericPrices = campgrounds
        .map(campground => campground.price)
        .filter(price => typeof price === 'number' && !Number.isNaN(price));
    const allReviews = campgrounds.flatMap(campground => campground.reviews);
    const totalReviews = allReviews.length;
    const averageRating = totalReviews
        ? (allReviews.reduce((total, review) => total + review.rating, 0) / totalReviews).toFixed(1)
        : null;
    const averagePrice = numericPrices.length
        ? (numericPrices.reduce((total, price) => total + price, 0) / numericPrices.length).toFixed(2)
        : null;
    const highestRatedCampground = campgrounds.reduce((highest, campground) => {
        if (campground.reviews.length === 0) return highest;
        const ratingTotal = campground.reviews.reduce((total, review) => total + review.rating, 0);
        const average = ratingTotal / campground.reviews.length;
        if (!highest || average > highest.averageRating) {
            return { campground, averageRating: average };
        }
        return highest;
    }, null);
    const stats = {
        totalCampgrounds,
        totalReviews,
        averageRating,
        averagePrice,
        highestRatedCampground
    };
    res.render('campgrounds/my-listings', { campgrounds, stats });
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
