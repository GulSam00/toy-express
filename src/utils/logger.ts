type LogLevel = "info" | "warn" | "error" | "debug";

const log = (level: LogLevel, message: string, ...args: unknown[]) => {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;

  switch (level) {
    case "error":
      console.error(logMessage, ...args);
      break;
    case "warn":
      console.warn(logMessage, ...args);
      break;
    case "debug":
      if (process.env.NODE_ENV === "development") {
        console.debug(logMessage, ...args);
      }
      break;
    default:
      console.log(logMessage, ...args);
  }
};

export const logger = {
  info: (message: string, ...args: unknown[]) => log("info", message, ...args),
  warn: (message: string, ...args: unknown[]) => log("warn", message, ...args),
  error: (message: string, ...args: unknown[]) => log("error", message, ...args),
  debug: (message: string, ...args: unknown[]) => log("debug", message, ...args),
};


