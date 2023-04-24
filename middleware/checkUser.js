const jwt = require("jsonwebtoken");
const User = require("../models/user");
const client = require("../startup/redis");

module.exports = async (req, res, next) => {
  const token = req.header("x-auth-token");
  try {
    if (token) {
      const dataInToken = jwt.verify(token, process.env.JWT_PRIVATE_KEY);
      const blackToken = await client.get(dataInToken._id.toString());
      if (dataInToken && blackToken !== token) {
        const user = await User.findById(dataInToken._id).select(
          "-password -createdAt -updatedAt -__v"
        );
        req.user = user;
      }
    }
    next();
  } catch (err) {
    console.log(err);
    res.status(400).send("invalid token");
  }
};
