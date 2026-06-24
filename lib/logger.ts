// lib/logger.ts
import fs from "fs";
import path from "path";

const LOGS_DIR = path.join(process.cwd(), "logs");
const LOG_FILE = path.join(LOGS_DIR, "wc-api.log");

// Ensure log directory exists
function ensureLogDir() {
  if (!fs.existsSync(LOGS_DIR)) {
    fs.mkdirSync(LOGS_DIR, { recursive: true });
  }
}

export function logWcApi(
  level: "INFO" | "WARNING" | "ERROR",
  context: string,
  message: string,
  errorObj?: any
) {
  try {
    ensureLogDir();
    const timestamp = new Date().toISOString();
    
    let errStr = "";
    if (errorObj) {
      if (errorObj instanceof Error) {
        errStr = `\nStack: ${errorObj.stack}`;
      } else {
        errStr = `\nPayload: ${JSON.stringify(errorObj, null, 2)}`;
      }
    }

    const logEntry = `[${timestamp}] [${level}] [${context}] ${message}${errStr}\n----------------------------------------\n`;
    
    // Append asynchronously to prevent blocking the HTTP execution flow, 
    // or sync if preferred. AppendFile is non-blocking.
    fs.appendFile(LOG_FILE, logEntry, "utf-8", (err) => {
      if (err) {
        console.error("Failed to write to log file:", err);
      }
    });
  } catch (err) {
    console.error("Failed to execute log function:", err);
  }
}
