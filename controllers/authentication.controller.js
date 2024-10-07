const User = require('../models/user');
const UserRequest = require("../models/userRequest");
const OTP = require("otp");
const jwt = require('jsonwebtoken');
const { hashPassword, comparePassword } = require("../services/hashingPassword");
const { transporter } = require("../services/mail");
const { EMAIL_SUBJECTS, OTP_EXPIRATION_TIME, HTTP_STATUS } = require("../config/constants");


const signupHandler = async (req, res) => {
    const { firstname, lastname, email, password, phone } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
        let otp = new OTP().totp();
        const mailOptions = {
            from: process.env.FROM_EMAIL,
            to: email,
            subject: EMAIL_SUBJECTS.SIGNUP,
            text: `One Time PassWord is: ${otp} . Dont share to anyone !!  Valid for 10 mins`
        }
        try {
            await transporter.sendMail(mailOptions);
            const hashedpassword = await hashPassword(password);
            await UserRequest.create({
                firstname, lastname, email, password: hashedpassword, phone, otp, otpExpirationTime: Date.now() + (10 * 60 * 1000)
            });
            res.status(HTTP_STATUS.OK).json({ message: 'OTP sent successfully!' });
        } catch (error) {
            console.error('Error sending email:', error);
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: 'Error sending OTP' });
        }
    }
    else {
        res.status(HTTP_STATUS.CONFLICT).json({ message: "user already exist" });
    }
};

const registerOtpValidateHandler = async (req, res) => {
    const { email, otpf } = req.body;
    const userReq = await UserRequest.findOne({ email });
    if (!userReq) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({ message: "User does not exist" });
    }

    if (Date.now() > userReq.otpExpirationTime) {
        return res.status(HTTP_STATUS.GONE).json({ message: "OTP has expired" });
    }
    if (otpf == userReq.otp) {
        const { firstname, lastname, email, password, phone } = userReq;
        await User.create({
            firstname,
            lastname,
            email,
            password,
            phone,
            isEmailVerified: true,
        });
        await UserRequest.deleteOne({ email });
        return res.status(HTTP_STATUS.OK).json({ message: "Successfully verified" });
    }

    userReq.otpAttempts += 1;

    if (userReq.otpAttempts >= 3) {
        await UserRequest.deleteOne({ email });
        return res.status(HTTP_STATUS.LOCKED).json({ message: "Too many failed attempts. Your account has been deleted." });
    } else {
        await userReq.save();
        return res.status(HTTP_STATUS.FORBIDDEN).json({ message: "You have entered the wrong OTP. You have " + (3 - userReq.otpAttempts) + " attempts left." });
    }
}

const loginHandler = async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({ message: "You entered wrong username or password" });
    }
    const passed = await comparePassword(password, user.password);
    if (!passed) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({ message: "You entered wrong username or password" });
    }
    const accessToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRATION });
    const refreshToken = jwt.sign({ userId: user._id }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN });
    res.cookie('accessToken', accessToken, {
        httpOnly: false,
        secure: true,
        maxAge: 960000,
        // sameSite: 'Lax' 
    });
    res.cookie('refreshToken', refreshToken, {
        httpOnly: false,
        secure: true,
        maxAge: 960000000,
        // sameSite: 'Lax' 
    });
    res.status(HTTP_STATUS.OK).json({ message: 'Login successfull' });
}

const forgotOtpSenderHandler = async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({ message: "user with entered email not exists" });
    }
    let otp = new OTP().totp();
    const mailOptions = {
        from: process.env.FROM_EMAIL,
        to: email,
        subject: EMAIL_SUBJECTS.FORGOT_PASSWORD,
        text: `One Time PassWord is: ${otp} . Ignore if not requested !!`
    }
    try {
        await transporter.sendMail(mailOptions);
        user.otp = otp;
        user.otpExpirationTime = new Date(Date.now() + OTP_EXPIRATION_TIME); //10min
        await user.save();
        res.status(HTTP_STATUS.OK).json({ message: 'OTP sent successfully!' });
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: 'Error sending OTP' });
    }
}


const forgotOtpVerifier = async (req, res) => {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({ message: "User with current email does not exist" });
    }

    if (Date.now() > user.otpExpirationTime) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({ message: "OTP has expired" });
    }

    if (user.otp === otp) {
        user.otp = "";
        user.otpAttempts = 0;
        user.otpExpirationTime = Date.now();
        await user.save();
        return res.status(HTTP_STATUS.OK).json({ message: "Successfully verified" });
    }

    user.otpAttempts += 1;

    if (user.otpAttempts >= 3) {
        user.otpAttempts = 0;
        user.otp = "";
        user.otpExpirationTime = Date.now();
        await user.save();
        return res.status(HTTP_STATUS.FORBIDDEN).json({ message: "Too many failed attempts. Please try again later" });
    } else {
        await user.save();
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({ message: "You have entered the wrong OTP. You have " + (3 - user.otpAttempts) + " attempts left." });
    }
}

const changePasswordHandler = async (req, res) => {
    const { email, newpassword } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({ message: "User not found." });
    }
    const hashedpassword = await hashPassword(newpassword);
    user.password = hashedpassword;
    await user.save();
    res.status(HTTP_STATUS.OK).json({ message: "Your Password successfully changed" });
}

const logoutHandler = async (req, res) => {
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    res.status(HTTP_STATUS.OK).json({ message: 'Successfully logged out.' });
}

const getUserData = async (req, res) => {
    res.status(HTTP_STATUS.OK).json("hi");
}

const deleteForEditHandler = async (req, res) => {
    const { email } = req.body;

    try {
        const result = await UserRequest.deleteOne({ email });
        if (result.deletedCount === 0) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({ message: "No user found with that email." });
        }

        return res.status(HTTP_STATUS.OK).json({ message: "User successfully deleted." });
    } catch (error) {
        console.error("Error deleting user:", error);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: "An error occurred while trying to delete the user. Please try again." });
    }
};


const verifyToken = async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'Invalid token' });
        }

        try {

            const user = await User.findById(decoded.userId);

            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }


            const userData = {
                id: user._id,
                firstname: user.firstname,
                lastname: user.lastname,
                email: user.email,
                phone: user.phone,
                address: user.address
            };
            res.status(200).json({ message: 'Token is valid', user: userData });
        } catch (fetchError) {
            console.error("Error fetching user:", fetchError);
            res.status(500).json({ message: 'Error fetching user data' });
        }
    });
};

const updateProfile = async (req, res) => {
    const { firstname, lastname, email, phone } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }

    user.firstname = firstname ?? user.firstname;
    user.lastname = lastname ?? user.lastname;
    user.phone = phone ?? user.phone;
    // user.address.push(address);

    await user.save();

    return res.status(200).json({ message: "Profile updated successfully", user });
}


module.exports = { updateProfile, verifyToken, forgotOtpVerifier, signupHandler, loginHandler, forgotOtpSenderHandler, registerOtpValidateHandler, changePasswordHandler, deleteForEditHandler, getUserData, logoutHandler };
