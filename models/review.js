import mongoose,{Schema} from "mongoose";

const reviewSchema=new Schema({
    body:String,
    rating:Number
})
export const Review=new mongoose.model('Review',reviewSchema);