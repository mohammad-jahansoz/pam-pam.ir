const User = require("../models/user");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

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
    return res.status(400).send("you have account in our database . pls login");
  }
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);
  const user = new User({ email: email, password: hash });
  await user.save();

  req.session._id = user._id;
};

exports.postSignIn = async (req, res, next) => {
  const { email, password } = req.body;
  let user = await User.findOne({ email: email });
  if (!user) {
    return res
      .status(400)
      .send(`we havent any user with ${email} email . pls signup `);
  }
  const result = await bcrypt.compare(password, user.password);
  if (!result) {
    return res.status(400).send("your password is incorrect ! try again");
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
  res.render("client/signin");
};

exports.getSignup = (req, res, next) => {
  res.render("client/signup");
};
