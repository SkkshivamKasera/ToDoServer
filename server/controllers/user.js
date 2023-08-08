import { User } from '../models/user.js'
import { sendMail } from '../utils/sendMail.js'
import { sendToken } from '../utils/sendToken.js'
import cloudinary from 'cloudinary'
import fs from 'fs'

export const register = async (req, res, next) => {
    try{
        const { name, email, password } = req.body
        const avatar = req.files.avatar.tempFilePath
        let user = await User.findOne({email})
        if(user){
            return res.status(400).json({success: false, message: "User already exists"})
        }
        const otp = Math.floor(Math.random() * 1000000)
        const myCloud = await cloudinary.v2.uploader.upload(avatar, {
            folder: process.env.CLOUD_FOLDER
        })
        fs.rmSync("./tmp", {recursive: true})
        user = await User.create({name, email, password, avatar:{
            public_id: myCloud.public_id,
            url: myCloud.secure_url
        }, otp, otp_expiry: new Date(Date.now() + process.env.OTP_EXPIRE*60*1000)})
        await sendMail(email, "Verify Your Account", `Your OTP is ${otp}`)
        sendToken(res, user, 201, "OTP sent to your email")
    }catch(error){
        res.status(500).json({success: false, message: error.message})
    }
}

export const verify = async (req, res) => {
    try{
        const otp = Number(req.body.otp)
        const user = await User.findById(req.user._id)
        if(user.otp !== otp || user.otp_expiry < Date.now()){
            return res.status(400).json({success: false, message: "Invalid OTP or has been expired"})
        }
        user.verified = true
        user.otp = null
        user.otp_expiry = null

        await user.save()

        sendToken(res, user, 200, "Account Verified")
    }catch(error){
        res.status(500).json({success: false, message: error.message})
    }
}

export const login = async (req, res, next) => {
    try{
        const { email, password } = req.body
        if(!email || !password){
            return res.status(400).json({success: false, message: "Please Enter All Fields"})
        }
        // const { avatar } = req.files
        const user = await User.findOne({email}).select("+password")
        if(!user){
            return res.status(400).json({success: false, message: "Invalid Email or Password"})
        }
        const isMatch = await user.comparePassword(password)
        if(!isMatch){
            return res.status(400).json({success: false, message: "Invalid Email or Password"})
        }
        sendToken(res, user, 200, "Login Successfully")
    }catch(error){
        res.status(500).json({success: false, message: error.message})
    }
}

export const logout = async (req, res, next) => {
    try{
        res.status(200).cookie("token", null, {
            expires: new Date(Date.now())
        })
        .json({
            success: true,
            message: "Logout Successfully"
        })
    }catch(error){
        res.status(500).json({success: false, message: error.message})
    }
}

export const addTask = async (req, res, next) => {
    try{
        const { title, description } = req.body
        const user = await User.findById(req.user._id)
        user.tasks.push({title, description, completed:false, createdAt: new Date(Date.now())})
        await user.save()
        res.status(200).json({success: true, message: "🎉🎉🎉Task Added Successfully🎉🎉🎉"})
    }catch(error){
        res.status(500).json({success: false, message: error.message})
    }
}

export const removeTask = async (req, res, next) => {
    try{
        const { taskId } = req.params
        const user = await User.findById(req.user._id)
        user.tasks = user.tasks.filter(task => task._id.toString() !== taskId.toString())
        await user.save()
        res.status(200).json({success: true, message: "🎉🎉🎉Task Deleted Successfully🎉🎉🎉"})
    }catch(error){
        res.status(500).json({success: false, message: error.message})
    }
}

export const updateTask = async (req, res, next) => {
    try{
        const { taskId } = req.params
        const user = await User.findById(req.user._id)
        user.task = user.tasks.find(task => task._id.toString() === taskId.toString())
        user.task.completed = !user.task.completed
        await user.save()
        res.status(200).json({success: true, message: "🎉🎉🎉Task Updated Successfully🎉🎉🎉"})
    }catch(error){
        res.status(500).json({success: false, message: error.message})
    }
}

export const getMyProfile = async (req, res, next) => {
    try{
        const user = await User.findById(req.user._id)
        sendToken(res, user, 200, `Welcome ${user.name}`)
    }catch(error){
        res.status(500).json({success: false, message: error.message})
    }
}

export const updateProfile = async (req, res, next) => {
    try{
        const user = await User.findById(req.user._id)
        const { name } = req.body
        const avatar = req.files.avatar.tempFilePath
        if(name){ user.name = name }
        if(avatar){
            await cloudinary.v2.uploader.destroy(user.avatar.public_id)
            const myCloud = await cloudinary.v2.uploader.upload(avatar, {
                folder: process.env.CLOUD_FOLDER
            })
            fs.rmSync("./tmp", {recursive: true})
            user.avatar = {
                public_id: myCloud.public_id,
                url: myCloud.secure_url
            }
        }
        await user.save()
        res.status(200).json({success: true, message: "🎉🎉🎉Profile Updated Successfully🎉🎉🎉"})
    }catch(error){
        res.status(500).json({success: false, message: error.message})
    }
}

export const updatePassword = async (req, res, next) => {
    try{
        const user = await User.findById(req.user._id).select("+password")
        const { oldpassword, newpassword } = req.body
        if(!oldpassword || !newpassword){
            return res.status(400).json({success: false, message: "Please Enter All Fields"})
        }
        const isMatch = await user.comparePassword(oldpassword)
        if(!isMatch){ return res.status(400).json({success: false, message: "Invalid Old Password"}) }
        user.password = newpassword
        await user.save()
        res.status(200).json({success: true, message: "🎉🎉🎉Password Updated Successfully🎉🎉🎉"})
    }catch(error){
        res.status(500).json({success: false, message: error.message})
    }
}

export const forgotPassword = async (req, res, next) => {
    try{
        const { email } = req.body
        const user = await User.findOne({email})
        if(!user){
            return res.status(400).json({success: false, message: "Invalid Email"})
        }
        const otp = Math.floor(Math.random() * 1000000)
        user.resetPasswordOTP = otp
        user.resetPasswordOTP_expiry = Date.now() + 10 *60 * 1000
        await user.save()
        const message = `Your OTP for reseting the password is ${otp}. If you did not request for this, please ignore this email.`
        await sendMail(email, "Request for Reseting Password", message)
        res.status(200).json({success: true, message: `OTP sent to => ${email}`})
    }catch(error){
        res.status(500).json({success: false, message: error.message})
    }
}

export const resetPassword = async (req, res, next) => {
    try{
        const { otp, newpassword } = req.body
        const user = await User.findOne(
            {resetPasswordOTP: otp, resetPasswordOTP_expiry: {$gt: Date.now()}}
        ).select("+password")
        if(!user){
            return res.status(400).json({success: false, message: "Invalid OTP or Has Been Expired"})
        }
        user.password = newpassword
        user.resetPasswordOTP = null
        user.resetPasswordOTP_expiry = null
        await user.save()
        res.status(200).json({success: true, message: "Password Changed Successfully"})
    }catch(error){
        res.status(500).json({success: false, message: error.message})
    }
}