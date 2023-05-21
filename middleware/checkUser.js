const User = require("../models/user");
const logger = require("../startup/logger");

module.exports = async (req, res, next) => {
  if (req.session._id) {
    const user = await User.findById(req.session._id).select(
      "-password -createdAt -updatedAt "
    );
    if (user) {
      req.user = user;
    } else {
      req.session.destroy(function (err) {
        logger.error(err.message);
      });
    }
  }
  next();
};
