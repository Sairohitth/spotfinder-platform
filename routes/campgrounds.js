import express from 'express'
const router=express.Router()
import {catchAsync} from '../utils/catchAsync.js'
import { Campground } from '../models/campground.js'
import { isLoggedin, validateCampground, isAuthor } from '../middleware.js'
import * as campgrounds from '../controllers/campgrounds.js'

router.route('/')
.get(catchAsync(campgrounds.index))
.post(isLoggedin,validateCampground,catchAsync(campgrounds.createCampground))

router.get('/new',isLoggedin,campgrounds.renderNewForm)

router.route('/:id')
.get(catchAsync(campgrounds.showCampground))
.put(isLoggedin,isAuthor,validateCampground,catchAsync(campgrounds.updateCampground))
.delete(isLoggedin,isAuthor,catchAsync(campgrounds.deleteCampground))

router.get('/:id/edit', isLoggedin, isAuthor, catchAsync(campgrounds.renderEditForm))

export default router;