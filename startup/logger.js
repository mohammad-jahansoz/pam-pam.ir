const winston = require("winston");
let alignColorsAndTime = winston.format.combine(
  winston.format.colorize({
    all: true,
  }),
  winston.format.label({
    label: "[LOGGER]",
  }),
  winston.format.timestamp({
    format: "YY-MM-DD HH:mm:ss",
  }),
  winston.format.printf(
    (info) =>
      ` ${info.label}  ${info.timestamp}  ${info.level} : ${info.message}`
  )
);
const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  transports: [
    new winston.transports.MongoDB({
      db: "mongodb://127.0.0.1:27017/pam-pam",
      level: "info",
    }),
    new winston.transports.Console({
      level: "info",
      format: alignColorsAndTime,
    }),
  ],
  exceptionHandlers: [
    new winston.transports.Console({
      format: alignColorsAndTime,
    }),
    new winston.transports.File({
      filename: "uncaughtExceptions.log",
      format: winston.format.json(),
    }),
  ],
  rejectionHandlers: [
    new winston.transports.Console({
      format: alignColorsAndTime,
    }),
    new winston.transports.File({
      filename: "uncaughtExceptions.log",
      format: winston.format.json(),
    }),
  ],
});

module.exports = logger;
