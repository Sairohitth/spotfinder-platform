import mongoose, {Schema} from "mongoose";
const CampgroundSchema=new Schema({
    title:String,
    image:String,
    price:Number,
    description:String,
    location:String
})

export const Campground=mongoose.model('Campground',CampgroundSchema)