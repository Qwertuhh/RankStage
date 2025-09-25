import { createLogger, format, transports, Logger } from "winston";

const env = process.env.NODE_ENV || "development";

let logger: Logger;

const jsonFileFormat = format.combine(format.timestamp(), format.json());

const serverTransports = [
  new transports.File({
    filename: "logs/error.log",
    level: "error",
    format: jsonFileFormat,
  }),
  new transports.File({
    filename: "logs/combined.log",
    format: jsonFileFormat,
  }),
];

if (env === "production") {
  logger = createLogger({
    level: "info",
    transports: [
      ...serverTransports,
      new transports.Console({
        format: format.combine(
          format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
          format.colorize(),
          format.printf(({ level, message, timestamp }) => {
            return `[${timestamp}] ${level.toUpperCase()}: ${message}`;
          })
        ),
      }),
    ],
  });
} else {
  logger = createLogger({
    level: "info",
    transports: [
      ...serverTransports,
      new transports.Console({
        format: format.combine(
          format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
          format.colorize(),
          format.printf(({ level, message, timestamp }) => {
            return `[${timestamp}] ${level.toUpperCase()}: ${message}`;
          })
        ),
      }),
    ],
  });
}

export default logger;
