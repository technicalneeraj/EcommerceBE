const express = require('express');
const { forgototpVerify ,signuphandler,loginhandler,forgotOtpSenderHandler,registerOtpValidateHandler} = require('../Controllers/Authentication.controller');

const router = express.Router();

router
.post('/forgototpverify', forgototpVerify)
.post("/signup",signuphandler)
.post("/login",loginhandler)
.post("/forgototpsender",forgotOtpSenderHandler)
.post("/otpvalidate",registerOtpValidateHandler)

module.exports = router;