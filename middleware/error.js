const logger = require("../startup/logger");

exports.error = (err, req, res, next) => {
  console.log(err.message + err);
  logger.error(err.message, err);
  res.status(500).send(`error server happen! ${err.message}`);
};

exports.error404 = (req, res, next) => {
  res.status(404).render("client/404");
};
