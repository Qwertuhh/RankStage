import { createLogger, format, transports } from "winston";

const env = process.env.NODE_ENV || "development";

let logger;

if (env === "production") {
  logger = createLogger({
    level: "info",
    format: format.json(),
    transports: [
      new transports.File({ filename: "logs/combined.log" }),
    ],
  });
} else {
  logger = createLogger({
    level: "info",
    format: format.combine(
      format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
      format.colorize(),
      format.printf(({ level: level, message: message, timestamp }) => {
        return `[${timestamp}] ${level.toUpperCase()}: ${message}`;
      })
    ),
    transports: [
      new transports.Console(),
      new transports.File({ filename: "logs/error.log", level: "error" }),
      new transports.File({ filename: "logs/combined.log" }),
    ],
  });
}

export default logger;

