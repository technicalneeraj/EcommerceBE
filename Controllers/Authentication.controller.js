const ActualUser = require('../Models/ActualUser');
const OTP = require("otp");
const jwt = require('jsonwebtoken');
const { hashPassword, comparePassword } = require("../services/HashingPassword");
const {transporter}=require("../services/Mail");

const forgototpVerify = async (req, res) => {
    const { email, otp } = req.body;
    const user = await ActualUser.findOne({ email });

    if (!user) {
        return res.status(400).json({ message: "User with current email does not exist" });
    }

    if (user.otp === otp) {
        user.otp = "";
        user.otpAttempts = 0; 
        await user.save();
        return res.status(200).json({ message: "Successfully verified" });
    }

    user.otpAttempts += 1;

    if (user.otpAttempts >= 3) {
        user.otpAttempts = 0;
        user.otp = ""; 
        await user.save();
        return res.status(403).json({ message: "Too many failed attempts. Please try again later" });
    } else {
        await user.save();
        return res.status(401).json({ message: "You have entered the wrong OTP. You have " + (3 - user.otpAttempts) + " attempts left." });
    }
};


const signuphandler=async (req, res) => {
    const { firstname,lastname,email,password,phone} = req.body;
    const user = await ActualUser.findOne({ email });
    console.log(user);
    if (!user) {
        let otp = new OTP().totp();
        console.log(otp);
        const mailOptions = {
            from: "beriwalneeraj2468@gmail.com",
            to: email,
            subject: "Your OTP for myApp",
            text: `One Time PassWord is: ${otp} . Dont share to anyone !!`
        }
        try {
            await transporter.sendMail(mailOptions);
            const hashedpassword = await hashPassword(password);
            const user = await ActualUser.create({
                firstname,lastname,email,password:hashedpassword,phone,otp
            });
            console.log(user);
            res.status(200).json({ message: 'OTP sent successfully!' });
        } catch (error) {
            console.error('Error sending email:', error);
            res.status(500).json({ message: 'Error sending OTP' });
        }
    }
    else {
        res.status(201).json({ message: "user already exist" });
    }
}

const loginhandler=async (req, res) => {
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
        httpOnly: true, //so that js cannot access it 
        maxAge: 60 * 60 * 1000 // 1 hour
    });
    res.status(200).json({ message: 'Login successful' });
}

const forgotOtpSenderHandler=async (req, res) => {
    const { email } = req.body;
    const user=await ActualUser.findOne({email});
    if(!user){
        return res.status(400).json({message:"user with entered email not exists"});
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
        user.otp=otp;
        await user.save();
        res.status(200).json({ message: 'OTP sent successfully!' });
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ message: 'Error sending OTP' });
    }
}

const registerOtpValidateHandler= async (req, res) => {
    const { email, otpf } = req.body;
    const user = await ActualUser.findOne({ email });
    if (!user) {
        return res.status(404).json({ message: "User does not exist" });
    }
    if (otpf === user.otp) {
        await ActualUser.updateOne({ email }, { isEmailVerified: true, otpAttempts: 0 ,otp:""}); // Reset attempts on success
        return res.status(200).json({ message: "Successfully verified" });
    }

    user.otpAttempts += 1;

    if (user.otpAttempts >= 3) {
        await ActualUser.deleteOne({ email }); 
        return res.status(403).json({ message: "Too many failed attempts. Your account has been deleted." });
    } else {

        await user.save();
        return res.status(401).json({ message: "You have entered the wrong OTP. You have " + (3 - user.otpAttempts) + " attempts left." });
    }
}

module.exports = { forgototpVerify,signuphandler,loginhandler,forgotOtpSenderHandler,registerOtpValidateHandler };
