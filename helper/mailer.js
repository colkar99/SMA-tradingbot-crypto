const nodemailer = require("nodemailer");
let options = {
  host: "smtp.gmail.com",
  port: 587,
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD,
  },
};
const transporter = nodemailer.createTransport(options);

exports.pingMailServer = async () => {
  transporter
    .verify()
    .then(console.log("Mail server Success"))
    .catch(console.error);
};

exports.sendMail = async (sub, body) => {
  try {
    await transporter.sendMail({
      from: `SMA TRADINGBOT ${process.env.EMAIL_USERNAME}`, // sender address
      to: `${process.env.RECEIVER_MAIL_ID}`, // list of receivers
      subject: `${sub} ✔`, // Subject line
      // text: body, // plain text body
      html: body, // html body
    });
  } catch (err) {
    console.log(err);
    next(err);
  }
};
