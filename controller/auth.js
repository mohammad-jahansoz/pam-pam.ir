const User = require("../models/user");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const logger = require("../startup/logger");
const flash = require("connect-flash");

const transporter = nodemailer.createTransport({
  host: process.env.NODEMAILER_HOST,
  port: process.env.NODEMAILER_PORT,
  secure: false,
  auth: {
    user: process.env.NODEMAILER_USER,
    pass: process.env.NODEMAILER_PASS,
  },
});

exports.postSignUp = async (req, res, next) => {
  const { email, password } = req.body;
  let findUser = await User.findOne({ email: email });
  if (findUser) {
    req.flash(
      "message",
      `با ایمیل ${email} قبلا ثبت نام کرده اید!لطفا وارد شوید.`
    );
    return res.redirect("/api/auth/signup");
  }
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);
  const user = new User({ email: email, password: hash });
  await user.save();
  req.session._id = user._id;
  res.redirect("/");
};

exports.postSignIn = async (req, res, next) => {
  const { email, password } = req.body;
  let user = await User.findOne({ email: email });
  if (!user) {
    req.flash("message", `کاربری با ایمیل ${email} پیدا نشد!`);
    return res.redirect("/api/auth/signin");
  }
  const result = await bcrypt.compare(password, user.password);
  if (!result) {
    req.flash(
      "message",
      `رمز وارد شده اشتباه میباشد!اگر رمز خود را فراموش کرده اید از گزینه فراموشی رمز عبور استفاده کنید!`
    );
    return res.redirect("/api/auth/signin");
  }
  req.session._id = user._id;
  res.redirect("/");
};

exports.sendPasswordRecoveryEmail = async (req, res, next) => {
  const { email } = req.body;
  const user = await User.findOne({ email: email });
  if (user) {
    const token = crypto.randomBytes(24).toString("hex");

    user.token = token;
    user.expireToken = new Date().getTime() + 60 * 60 * 1000;
    await user.save();
    res.send(user);
  }
};

exports.verifyPasswordRecoveryEmail = async (req, res, next) => {
  const { email, token } = req.params;
  const user = await User.findOne({
    email: email,
    token: token,
    expireToken: { $gt: new Date().getTime() },
  });
  console.log(user);
  res.send(user);
};

// exports.setNewPassword = async (req, res, next) => {
//   const jwtToken = req.header("x-auth-token");
//   const { email, token } = req.params;
//   const { password } = req.body;
//   const user = await User.findOne({
//     email: email,
//     token: token,
//     expireToken: { $gt: new Date().getTime() },
//   });
//   if (user) {
//     const salt = await bcrypt.genSalt(10);
//     const hash = await bcrypt.hash(password, salt);
//     user.password = hash;
//     user.token = undefined;
//     user.expireToken = undefined;
//     try {
//       await client.set(user._id.toString(), jwtToken);
//     } catch (err) {
//       console.log(err);
//     }
//     await user.save();
//     res.send("password changed");
//   } else {
//     res.send("pls try again send password recovery requrist");
//   }
// };

exports.getSignin = async (req, res, next) => {
  let message = req.flash("message");
  if (message.length <= 0) {
    message = null;
  }
  res.render("client/signin", { message });
};

exports.getSignup = (req, res, next) => {
  let message = req.flash("message");
  if (message.length <= 0) {
    message = null;
  }
  res.render("client/signup", { message });
};

exports.logout = (req, res, next) => {
  req.session.destroy();
  res.redirect("/");
};
