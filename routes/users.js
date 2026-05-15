import express from 'express'
const router = express.Router()
import { User } from '../models/user.js'
import { catchAsync } from '../utils/catchAsync.js'
import passport from 'passport'
import { storeReturnTo } from '../middleware.js'
import * as users from '../controllers/users.js'

router.route('/register')
.get(users.renderRegister)
.post(catchAsync(users.register))

router.route('/login')
.get(users.renderLogin)
.post(storeReturnTo,passport.authenticate('local',{failureFlash:true, failureRedirect:'/login'}),users.login)

router.get('/logout',users.logout)

export default router