import { createLogger, format, transports, Logger } from "winston";

const env = process.env.NODE_ENV || "development";

let logger: Logger;

// Check if the code is running on the server (i.e., not in the browser)
// The 'window' object is only available in the browser.
if (typeof window === "undefined") {
  // This code runs on the server (Node.js)

  // Define transports that use server-side modules
  const serverTransports = [
    new transports.File({ filename: "logs/error.log", level: "error" }),
    new transports.File({ filename: "logs/combined.log" }),
  ];

  if (env === "production") {
    logger = createLogger({
      level: "info",
      format: format.json(),
      transports: serverTransports,
    });
  } else {
    // Development environment on the server
    logger = createLogger({
      level: "info",
      format: format.combine(
        format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        format.colorize(),
        format.printf(({ level, message, timestamp }) => {
          return `[${timestamp}] ${level.toUpperCase()}: ${message}`;
        })
      ),
      // Use both console and file transports
      transports: [new transports.Console(), ...serverTransports],
    });
  }
} else {
  // This code runs in the browser (client-side)
  // We can only use transports that are safe for the browser, like the console.
  logger = createLogger({
    level: "info",
    format: format.combine(
      format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
      format.colorize(),
      format.printf(({ level, message, timestamp }) => {
        return `[${timestamp}] ${level.toUpperCase()}: ${message}`;
      })
    ),
    transports: [new transports.Console()],
  });
}

export default logger;
