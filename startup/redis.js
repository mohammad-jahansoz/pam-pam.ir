const redis = require("redis");
const client = redis.createClient();
const logger = require("../startup/logger");

client
  .connect()
  .then((res) => {
    logger.info("Connect to Redis");
  })
  .catch((err) => {
    logger.error(err.message, err);
  });

module.exports = client;
