import mongoose, {Schema} from "mongoose";
const CampgroundSchema=new Schema({
    title:String,
    price:String,
    description:String,
    location:String
})

export const Campground=mongoose.model('Campground',CampgroundSchema)