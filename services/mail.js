const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: process.env.MAIL_SERVICE,
  auth: {
    user: process.env.CREATOR_EMAIL,
    pass: process.env.CREATOR_EMAIL_PASSWORD,
  },
});

module.exports = { transporter };
