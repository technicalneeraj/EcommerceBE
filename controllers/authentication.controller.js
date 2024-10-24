const OTP = require("otp");
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const UserRequest = require("../models/userRequest.model");
const { transporter } = require("../services/mail");
const { userRegisterSchema } = require("../validations/userRegisterSchema");
const { userLoginSchema } = require("../validations/userLoginSchema");

const {
  hashPassword,
  comparePassword,
} = require("../services/hashingPassword");

const {
  EMAIL_SUBJECTS,
  OTP_EXPIRATION_TIME,
  HTTP_STATUS,
} = require("../config/constants");

const signupHandler = async (req, res) => {
  const { firstname, lastname, email, password, phone } = req.body;

  const { error } = userRegisterSchema.validate({
    firstname: firstname.trim(),
    lastname: lastname.trim(),
    email: email.trim(),
    password: password.trim(),
    phone: phone.trim(),
  });
  if (error) {
    return res
      .status(HTTP_STATUS.BAD_REQUEST)
      .json({ message: error.details[0].message });
  }
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res
      .status(HTTP_STATUS.CONFLICT)
      .json({ message: "User already exists" });
  }

  let otp = new OTP().totp();
  const mailOptions = {
    from: process.env.FROM_EMAIL,
    to: email,
    subject: EMAIL_SUBJECTS.SIGNUP,
    text: `One Time Password is: ${otp}. Don't share it with anyone! Valid for 10 mins`,
  };

  try {
    const userRequest = await UserRequest.findOne({ email });
    if (userRequest) {
      await UserRequest.deleteOne({ email });
    }
    await transporter.sendMail(mailOptions);
    const hashedPassword = await hashPassword(password);
    await UserRequest.create({
      firstname,
      lastname,
      email,
      password: hashedPassword,
      phone,
      otp,
      otpExpirationTime: Date.now() + 10 * 60 * 1000, // 10 minutes
    });

    res.status(HTTP_STATUS.OK).json({ message: "OTP sent successfully!" });
  } catch (error) {
    console.error("Error processing signup:", error);
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json({ message: "Error sending OTP" });
  }
};

const registerOtpValidateHandler = async (req, res) => {
  const { email, otpf } = req.body;
  const userReq = await UserRequest.findOne({ email });
  if (!userReq) {
    return res
      .status(HTTP_STATUS.NOT_FOUND)
      .json({ message: "User does not exist" });
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
    return res
      .status(HTTP_STATUS.OK)
      .json({ message: "Successfully verified" });
  }

  userReq.otpAttempts += 1;

  if (userReq.otpAttempts >= 3) {
    await UserRequest.deleteOne({ email });
    return res.status(HTTP_STATUS.LOCKED).json({
      message: "Too many failed attempts. Please try again later!!",
    });
  } else {
    await userReq.save();
    return res.status(HTTP_STATUS.FORBIDDEN).json({
      message:
        "You have entered the wrong OTP. You have " +
        (3 - userReq.otpAttempts) +
        " attempts left.",
    });
  }
};

const loginHandler = async (req, res) => {
  const { email, password } = req.body;
  console.log(email);
  const { error } = userLoginSchema.validate({ email, password });
  if (error) {
    return res
      .status(HTTP_STATUS.BAD_REQUEST)
      .json({ message: error.details[0].message });
  }
  const user = await User.findOne({ email });
  if (!user) {
    return res
      .status(HTTP_STATUS.UNAUTHORIZED)
      .json({ message: "You entered wrong username or password" });
  }
  const passed = await comparePassword(password, user.password);
  if (!passed) {
    return res
      .status(HTTP_STATUS.UNAUTHORIZED)
      .json({ message: "You entered wrong username or password" });
  }
  const accessToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRATION,
  });
  const refreshToken = jwt.sign(
    { userId: user._id },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN }
  );
  res.cookie("accessToken", accessToken, {
    httpOnly: false,
    secure: true,
    maxAge: 7200000,
    // sameSite: 'Lax'
  });
  res.cookie("refreshToken", refreshToken, {
    httpOnly: false,
    secure: true,
    maxAge: 7200000,
    // sameSite: 'Lax'
  });

  const userData = {
    id: user._id,
    firstname: user.firstname,
    lastname: user.lastname,
    email: user.email,
    phone: user.phone,
    address: user.address,
    role: user.role,
  };
  res
    .status(HTTP_STATUS.OK)
    .json({ message: "Login successfull", user: userData });
};

const forgotOtpSenderHandler = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return res
      .status(HTTP_STATUS.BAD_REQUEST)
      .json({ message: "user with entered email not exists" });
  }
  let otp = new OTP().totp();
  const mailOptions = {
    from: process.env.FROM_EMAIL,
    to: email,
    subject: EMAIL_SUBJECTS.FORGOT_PASSWORD,
    text: `One Time PassWord is: ${otp} . Ignore if not requested !!`,
  };
  try {
    await transporter.sendMail(mailOptions);
    user.otp = otp;
    user.otpExpirationTime = new Date(Date.now() + OTP_EXPIRATION_TIME); //10min
    await user.save();
    res.status(HTTP_STATUS.OK).json({ message: "OTP sent successfully!" });
  } catch (error) {
    console.error("Error sending email:", error);
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json({ message: "Error sending OTP" });
  }
};

const forgotOtpVerifier = async (req, res) => {
  const { email, otp } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    return res
      .status(HTTP_STATUS.BAD_REQUEST)
      .json({ message: "User with current email does not exist" });
  }

  if (Date.now() > user.otpExpirationTime) {
    return res
      .status(HTTP_STATUS.BAD_REQUEST)
      .json({ message: "OTP has expired" });
  }

  if (user.otp === otp) {
    user.otp = "";
    user.otpAttempts = 0;
    user.otpExpirationTime = Date.now();
    await user.save();
    return res
      .status(HTTP_STATUS.OK)
      .json({ message: "Successfully verified" });
  }

  user.otpAttempts += 1;

  if (user.otpAttempts >= 3) {
    user.otpAttempts = 0;
    user.otp = "";
    user.otpExpirationTime = Date.now();
    await user.save();
    return res
      .status(HTTP_STATUS.FORBIDDEN)
      .json({ message: "Too many failed attempts. Please try again later" });
  } else {
    await user.save();
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({
      message:
        "You have entered the wrong OTP. You have " +
        (3 - user.otpAttempts) +
        " attempts left.",
    });
  }
};

const changePasswordHandler = async (req, res) => {
  const { email, newpassword } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return res
      .status(HTTP_STATUS.NOT_FOUND)
      .json({ message: "User not found." });
  }
  const hashedpassword = await hashPassword(newpassword);
  user.password = hashedpassword;
  await user.save();
  res
    .status(HTTP_STATUS.OK)
    .json({ message: "Your Password successfully changed" });
};

const logoutHandler = async (req, res) => {
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");
  res.status(HTTP_STATUS.OK).json({ message: "Successfully logged out." });
};

const getUserData = async (req, res) => {
  res.status(HTTP_STATUS.OK).json("hi");
};

const deleteForEditHandler = async (req, res) => {
  const { email } = req.body.data;

  try {
    const result = await UserRequest.deleteOne({ email });
    if (result.deletedCount === 0) {
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .json({ message: "No user found with that email." });
    }

    return res
      .status(HTTP_STATUS.OK)
      .json({ message: "User successfully deleted." });
  } catch (error) {
    console.error("Error deleting user:", error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      message:
        "An error occurred while trying to delete the user. Please try again.",
    });
  }
};

const verifyToken = async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res
      .status(HTTP_STATUS.UNAUTHORIZED)
      .json({ message: "No token provided" });
  }

  jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
    if (err) {
      return res
        .status(HTTP_STATUS.UNAUTHORIZED)
        .json({ message: "Invalid token" });
    }

    const user = await User.findById(decoded.userId).populate("address");

    if (!user) {
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .json({ message: "User not found" });
    }

    const userData = {
      id: user._id,
      firstname: user.firstname,
      lastname: user.lastname,
      email: user.email,
      phone: user.phone,
      address: user.address,
      role: user.role,
    };
    res
      .status(HTTP_STATUS.OK)
      .json({ message: "Token is valid", user: userData });
  });
};

const updateProfile = async (req, res) => {
  const { firstname, lastname, email, phone } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return res
      .status(HTTP_STATUS.NOT_FOUND)
      .json({ message: "User not found" });
  }

  user.firstname = firstname ?? user.firstname;
  user.lastname = lastname ?? user.lastname;
  user.phone = phone ?? user.phone;
  // user.address.push(address);

  await user.save();

  return res
    .status(HTTP_STATUS.OK)
    .json({ message: "Profile updated successfully", user });
};

const deleteAccountHandler = async (req, res) => {
  const userData = req.body;
  const user = await User.findById(userData.id);
  if (!user) {
    return res
      .status(HTTP_STATUS.NOT_FOUND)
      .json({ message: "User not found" });
  }
  await User.deleteOne({ _id: userData.id });

  res.status(HTTP_STATUS.OK).json({ message: "Account deleted successfully" });
};

module.exports = {
  deleteAccountHandler,
  updateProfile,
  verifyToken,
  forgotOtpVerifier,
  signupHandler,
  loginHandler,
  forgotOtpSenderHandler,
  registerOtpValidateHandler,
  changePasswordHandler,
  deleteForEditHandler,
  getUserData,
  logoutHandler,
};
