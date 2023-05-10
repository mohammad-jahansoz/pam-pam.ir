const logger = require("../startup/logger");

module.exports = (err, req, res, next) => {
  console.log(err.message + err);
  logger.error(err.message, err);
  res.status(500).send(`error server happen! ${err.message}`);
};
