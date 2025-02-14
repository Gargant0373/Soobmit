// logger.js
const { createLogger, format, transports } = require("winston");
const path = require("path");
const fs = require("fs");

const logDir = path.join(__dirname, "..", "logs");
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

const consoleFormat = format.combine(
  format.colorize(),
  format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  format.printf(({ timestamp, level, message }) => {
    return `${timestamp} [${level}]: ${message}`;
  })
);

const fileFormat = format.combine(
  format.timestamp(),
  format.json()
);

const logger = createLogger({
  level: "info",
  transports: [
    new transports.Console({
      format: consoleFormat
    }),
    new transports.File({
      filename: "server.log",
      dirname: logDir,
      format: fileFormat
    })
  ]
});

module.exports = logger;
