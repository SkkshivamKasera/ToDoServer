import express from 'express'
import { addTask, forgotPassword, getMyProfile, login, logout, register, removeTask, resetPassword, updatePassword, updateProfile, updateTask, verify } from '../controllers/user.js'
import { isAuthenticated } from '../middleware/auth.js'

const router = express.Router()

router.route('/register').post(register)
router.route('/verify').post(isAuthenticated, verify)
router.route('/login').post(login)
router.route('/me').get(isAuthenticated, getMyProfile)
router.route('/logout').get(logout)
router.route('/updateProfile').put(isAuthenticated, updateProfile)
router.route('/updatePassword').put(isAuthenticated, updatePassword)

router.route('/forgotPassword').post(forgotPassword)
router.route('/resetPassword').put(resetPassword)

router.route('/newtask').post(isAuthenticated, addTask)
router.route('/task/:taskId').get(isAuthenticated, updateTask).delete(isAuthenticated, removeTask)

export default router