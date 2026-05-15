import express from 'express'
const router=express.Router({mergeParams:true})
import {catchAsync} from '../utils/catchAsync.js'
import { Campground } from '../models/campground.js'
import { Review } from '../models/review.js'
import { ExpressError } from '../utils/ExpressError.js'
import { validateReview, isLoggedin, isReviewAuthor } from '../middleware.js'
import * as reviews from '../controllers/reviews.js'



router.post('/',isLoggedin,validateReview,catchAsync(reviews.createReview))

router.delete('/:reviewId',isLoggedin,isReviewAuthor,catchAsync(reviews.deleteReview))

export default router