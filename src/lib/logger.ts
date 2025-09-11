type LogLevel = "info" | "warn" | "error";

interface LogMessage<T> {
  message: string;
  error?: Error;
  context?: Record<string, T>;
  timestamp: string;
  level: LogLevel;
}

class LoggerClass {
  private static instance: LoggerClass;
  private isDevelopment = process.env.NODE_ENV === "development";

  private constructor() {}

  static getInstance(): LoggerClass {
    if (!LoggerClass.instance) {
      LoggerClass.instance = new LoggerClass();
    }
    return LoggerClass.instance;
  }

  private formatMessage<T>(log: LogMessage<T>): string {
    const { timestamp, level, message, error, context } = log;
    return JSON.stringify({
      timestamp,
      level,
      message,
      ...(error && { error: this.formatError(error) }),
      ...(context && { context }),
    });
  }

  private formatError(error: Error): object {
    return {
      name: error.name,
      message: error.message,
      stack: this.isDevelopment ? error.stack : undefined,
    };
  }

  private log<T>(
    level: LogLevel,
    message: string,
    error?: Error,
    context?: Record<string, T>
  ) {
    const timestamp = new Date().toISOString();
    const logMessage: LogMessage<T> = {
      timestamp,
      level,
      message,
      error,
      context,
    };

    const formattedMessage = this.formatMessage(logMessage);

    // In development, log to console with colors
    if (this.isDevelopment) {
      const consoleMethod =
        level === "error" ? "error" : level === "warn" ? "warn" : "log";
      console[consoleMethod](formattedMessage);
      if (error?.stack) {
        console[consoleMethod](error.stack);
      }
    }

    // In production, you would typically send this to a logging service
    // Example: await fetch('/api/logs', { method: 'POST', body: formattedMessage });
  }

  info(message: string, context?: Record<string, unknown>) {
    this.log("info", message, undefined, context);
  }

  warn(message: string, error?: Error, context?: Record<string, unknown>) {
    this.log("warn", message, error, context);
  }

  error(message: string, error?: Error, context?: Record<string, unknown>) {
    this.log("error", message, error, context);
  }
}

const Logger = LoggerClass.getInstance();
export default Logger;
