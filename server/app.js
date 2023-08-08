import express from "express";
import User from './routers/user.js'
import cookieParser from "cookie-parser";
import bodyParser from 'body-parser'
import fileUpload from "express-fileupload";
import cors from 'cors'
export const app = express()

app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(cookieParser())
app.use(bodyParser.json())
app.use(fileUpload({
    limits: {fileSize: 50 * 1024 * 1024},
    useTempFiles: true
}))
app.use(cors())
app.use('/api/v1', User)