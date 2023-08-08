export const sendToken = (res, user, statusCode, message) => {
    const token = user.getJwtToken()
    const userData = {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        tasks: user.tasks,
        verified: user.verified
    }
    res.status(statusCode).cookie("token", token, {
        httpOnly: true,
        expires: new Date(Date.now() + process.env.COOKIE_EXPIRE*24*60*60*1000),
        secure: false
    }).json({success: true, message, userData})
}