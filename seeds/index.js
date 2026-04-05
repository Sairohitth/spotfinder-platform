import mongoose from 'mongoose'
import { Campground } from '../models/campground.js';
import { cities } from './cities.js'
import {places, descriptors} from './seedHelpers.js'

mongoose.connect('mongodb://127.0.0.1:27017/spot-finder')
.then(()=>{
    console.log("Database Connected")
})
.catch((err)=>{
    console.log("DB ERROR",err);
})

const sample=arr=>arr[Math.floor(Math.random()*arr.length)]

const seedDB=async()=>{
    await Campground.deleteMany({});
    for(let i=0;i<50;i++){
        const random1000=Math.floor(Math.random()*1000);
        const price=Math.floor(Math.random()*20)+10;
        const camp=new Campground({
            location:`${cities[random1000].city}, ${cities[random1000].state}`,
            title:`${sample(descriptors)} ${sample(places)}`,
            image: `https://picsum.photos/400?random=${Math.random()}`,
            description:"Lorem ipsum dolor sit, amet consectetur adipisicing elit. Laborum error quisquam doloribus sint tempore, ab dicta quis rerum fuga deleniti distinctio eius corporis perspiciatis, officiis neque molestias iure nemo nihil?",
            price
        })
        await camp.save()
    }
}
seedDB()
.then(()=>mongoose.connection.close())