const ActualUser = require('../Models/ActualUser');
const UserRequest=require("../Models/UserRequest");
const OTP = require("otp");
const jwt = require('jsonwebtoken');
const { hashPassword, comparePassword } = require("../Services/HashingPassword");
const { transporter } = require("../Services/Mail");

const signuphandler = async (req, res) => {
    const { firstname, lastname, email, password, phone } = req.body;
    const user = await ActualUser.findOne({ email });
    if (!user) {
        let otp = new OTP().totp();
        const mailOptions = {
            from: "beriwalneeraj2468@gmail.com",
            to: email,
            subject: "Your OTP for myApp",
            text: `One Time PassWord is: ${otp} . Dont share to anyone !!  Valid for 10 mins`
        }
        try {
            await transporter.sendMail(mailOptions);
            const hashedpassword = await hashPassword(password);
            const user = await UserRequest.create({
                firstname, lastname, email, password: hashedpassword, phone, otp,otpExpirationTime:Date.now()+(10*60*1000)
            });
            res.status(200).json({ message: 'OTP sent successfully!' });
        } catch (error) {
            console.error('Error sending email:', error);
            res.status(500).json({ message: 'Error sending OTP' });
        }
    }
    else {
        res.status(201).json({ message: "user already exist" });
    }
};

const registerOtpValidateHandler = async (req, res) => {
    const { email, otpf } = req.body;
    const userReq = await UserRequest.findOne({ email });
    if (!userReq) {
        return res.status(404).json({ message: "User does not exist" });
    }

    if (Date.now() > userReq.otpExpirationTime) {
        return res.status(400).json({ message: "OTP has expired" });
    }
    if (otpf == userReq.otp) {
        const { firstname, lastname, email, password, phone } = userReq;
        const newUser = await ActualUser.create({
            firstname,
            lastname,
            email,
            password,
            phone,
            isEmailVerified: true, 
        });
        await UserRequest.deleteOne({ email });
        return res.status(200).json({ message: "Successfully verified" });
    }

    userReq.otpAttempts += 1;

    if (userReq.otpAttempts >= 3) {
        await UserRequest.deleteOne({ email });
        return res.status(403).json({ message: "Too many failed attempts. Your account has been deleted." });
    } else {
        await userReq.save();
        return res.status(401).json({ message: "You have entered the wrong OTP. You have " + (3 - userReq.otpAttempts) + " attempts left." });
    }
}

const loginhandler = async (req, res) => {
    const { email, password } = req.body;
    const user = await ActualUser.findOne({ email });
    if (!user) {
        return res.status(201).json({ message: "You entered wrong username or password" });
    }
    const passed = await comparePassword(password, user.password);
    if (!passed) {
        return res.status(201).json({ message: "You entered wrong username or password" });
    }
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRATION });
    res.cookie('token', token, {
        httpOnly: true,
        maxAge: 60 * 60 * 1000,
        secure: false,
        sameSite: 'Lax'
    });
    res.status(200).json({ message: 'Login successful' });
}

const forgotOtpSenderHandler = async (req, res) => {
    const { email } = req.body;
    const user = await ActualUser.findOne({ email });
    if (!user) {
        return res.status(400).json({ message: "user with entered email not exists" });
    }
    let otp = new OTP().totp();
    const mailOptions = {
        from: "beriwalneeraj2468@gmail.com",
        to: email,
        subject: "Your OTP  for reseting password",
        text: `One Time PassWord is: ${otp} . Ignore if not requested !!`
    }
    try {
        await transporter.sendMail(mailOptions);
        user.otp = otp;
        user.otpExpirationTime=Date.now()*(10*60*1000) //10min
        await user.save();
        res.status(200).json({ message: 'OTP sent successfully!' });
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ message: 'Error sending OTP' });
    }
}


const forgototpVerify = async (req, res) => {
    const { email, otp } = req.body;
    const user = await ActualUser.findOne({ email });

    if (!user) {
        return res.status(400).json({ message: "User with current email does not exist" });
    }

    if (Date.now() > user.otpExpirationTime) {
        return res.status(400).json({ message: "OTP has expired" });
    }

    if (user.otp === otp) {
        user.otp = "";
        user.otpAttempts = 0;
        user.otpExpirationTime=Date.now();
        await user.save();
        return res.status(200).json({ message: "Successfully verified" });
    }

    user.otpAttempts += 1;

    if (user.otpAttempts >= 3) {
        user.otpAttempts = 0;
        user.otp = "";
        user.otpExpirationTime=Date.now();
        await user.save();
        return res.status(403).json({ message: "Too many failed attempts. Please try again later" });
    } else {
        await user.save();
        return res.status(401).json({ message: "You have entered the wrong OTP. You have " + (3 - user.otpAttempts) + " attempts left." });
    }
}

const changePasswordHandler = async (req, res) => {
    const { email, newpassword } = req.body;
    const user = await ActualUser.findOne({ email });
    if (!user) {
        return res.status(400).json({ message: "You are not authorized" });
    }
    const hashedpassword = await hashPassword(newpassword);
    user.password = hashedpassword;
    await user.save();
    res.status(200).json({ message: "Your Password successfully changed" });
}

const logouthandler=async(req, res) => {
        res.clearCookie('token');
        res.json({ message: 'Successfully logged out.' });
}

const gettinguserdata=async(req,res)=>{
    res.json("hi");
}

module.exports = { forgototpVerify, signuphandler, loginhandler, forgotOtpSenderHandler, registerOtpValidateHandler, changePasswordHandler ,gettinguserdata,logouthandler};
