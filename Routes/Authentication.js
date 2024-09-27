const express = require('express');
const { forgototpVerify ,signuphandler,loginhandler,forgotOtpSenderHandler,registerOtpValidateHandler,changePasswordHandler,gettinguserdata,logouthandler} = require('../Controllers/Authentication.controller');
const {CatchAsync}=require("../Utils/CatchAsync");
const router = express.Router()
const authMiddleware = require('../Middlewares/authMiddleware');;

router
.post('/forgototpverify',CatchAsync(forgototpVerify))
.post("/um/user-request",CatchAsync(signuphandler))
.post("/um/user/login",CatchAsync(loginhandler))
.post("/forgototpsender",CatchAsync(forgotOtpSenderHandler))
.post("/um/user-request/verifyOTP",CatchAsync(registerOtpValidateHandler))
.patch("/changepassword",CatchAsync(changePasswordHandler))
.get("/userdata",authMiddleware,CatchAsync(gettinguserdata))
.post('/logout',authMiddleware,CatchAsync(logouthandler));

module.exports = router;