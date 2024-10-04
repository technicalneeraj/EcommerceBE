const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.CREATOR_EMAIL,
        pass: process.env.CREATOR_EMAIL_PASSWORD,
    },
});

module.exports={transporter};