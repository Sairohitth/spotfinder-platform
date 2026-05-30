import express from 'express'
const router=express.Router()
import {catchAsync} from '../utils/catchAsync.js'
import { Campground } from '../models/campground.js'
import { isLoggedin, validateCampground, isAuthor } from '../middleware.js'
import * as campgrounds from '../controllers/campgrounds.js'
import multer from 'multer'
import { storage } from '../cloudinary/index.js';
const upload = multer({ storage });

router.route('/')
.get(catchAsync(campgrounds.index))
.post(isLoggedin,upload.array('image'),validateCampground,catchAsync(campgrounds.createCampground))

router.get('/new',isLoggedin,campgrounds.renderNewForm)

router.route('/:id')
.get(catchAsync(campgrounds.showCampground))
.put(isLoggedin,isAuthor,upload.array('image'),validateCampground,catchAsync(campgrounds.updateCampground))
.delete(isLoggedin,isAuthor,catchAsync(campgrounds.deleteCampground))

router.get('/:id/edit', isLoggedin, isAuthor, catchAsync(campgrounds.renderEditForm))

export default router;