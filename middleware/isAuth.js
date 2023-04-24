const jwt = require("jsonwebtoken");
const client = require("../startup/redis");

module.exports = async (req, res, next) => {
  try {
    const token = req.header("x-auth-token");
    if (!token) return res.status(401).send("access denied. no token provide");
    const dataInToken = jwt.verify(token, process.env.JWT_PRIVATE_KEY);
    const blackToken = await client.get(dataInToken._id.toString());
    if (blackToken !== token && dataInToken) {
      return next();
    }
    return res.status(401).send("access denied. invelid token");
  } catch (err) {
    console.log(err);
    res.status(400).send("invalid token");
  }
};
