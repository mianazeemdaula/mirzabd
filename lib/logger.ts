// lib/logger.ts
import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";

const LOGS_DIR = path.join(process.cwd(), "logs");
const LOG_FILE = path.join(LOGS_DIR, "wc-api.log");
const REQUESTS_LOG_FILE = path.join(LOGS_DIR, "requests.json");

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
    
    fs.appendFile(LOG_FILE, logEntry, "utf-8", (err) => {
      if (err) {
        console.error("Failed to write to log file:", err);
      }
    });
  } catch (err) {
    console.error("Failed to execute log function:", err);
  }
}

/**
 * Logs a structured WooCommerce API request and response to requests.json
 */
export async function logWcRequestResponse(
  req: Request,
  res: Response,
  duration: number,
  responseBody?: any
) {
  try {
    ensureLogDir();

    const { pathname, searchParams } = new URL(req.url);
    const query: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      query[key] = value;
    });

    const headers: Record<string, string> = {};
    req.headers.forEach((value, key) => {
      headers[key] = value;
    });

    const cookiesHeader = req.headers.get("cookie") || "";
    const cookies: Record<string, string> = {};
    cookiesHeader.split(";").forEach((cookie) => {
      const parts = cookie.split("=");
      if (parts.length === 2) {
        cookies[parts[0].trim()] = parts[1].trim();
      }
    });

    let body: any = null;
    let rawBody: string | null = null;
    try {
      const clonedReq = req.clone();
      rawBody = await clonedReq.text();
      if (rawBody) {
        try {
          body = JSON.parse(rawBody);
        } catch {
          body = rawBody;
        }
      }
    } catch (e) {
      // Ignore request body read error
    }

    let resBody = responseBody;
    if (resBody === undefined) {
      try {
        const clonedRes = res.clone();
        resBody = await clonedRes.text();
        try {
          resBody = JSON.parse(resBody);
        } catch {
          // Keep as text
        }
      } catch (e) {
        // Ignore response body read error
      }
    }

    const responseHeaders: Record<string, string> = {};
    res.headers.forEach((value, key) => {
      responseHeaders[key] = value;
    });

    const logEntry = {
      id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2),
      timestamp: new Date().toISOString(),
      method: req.method,
      path: pathname,
      url: req.url,
      ip: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "::1",
      headers,
      query,
      cookies,
      body,
      rawBody,
      parseError: null,
      files: [],
      response: {
        statusCode: res.status,
        headers: responseHeaders,
        duration,
        body: typeof resBody === "object" ? JSON.stringify(resBody) : String(resBody || ""),
      },
    };

    let requestLogs: any[] = [];
    if (fs.existsSync(REQUESTS_LOG_FILE)) {
      try {
        const fileContent = fs.readFileSync(REQUESTS_LOG_FILE, "utf-8").trim();
        if (fileContent) {
          const parsed = JSON.parse(fileContent);
          if (Array.isArray(parsed)) {
            requestLogs = parsed;
          }
        }
      } catch (err) {
        // Ignore JSON parse error on startup
      }
    }

    requestLogs.push(logEntry);
    if (requestLogs.length > 150) {
      requestLogs.shift();
    }

    fs.writeFile(REQUESTS_LOG_FILE, JSON.stringify(requestLogs, null, 2), "utf-8", (err) => {
      if (err) {
        console.error("Failed to write request log to requests.json:", err);
      }
    });
  } catch (err) {
    console.error("Failed to log request/response:", err);
  }
}

/**
 * Route handler wrapper to automatically time and log WooCommerce REST requests and responses.
 */
export function withWcLogging(handler: (req: Request, context: any) => Promise<Response>) {
  return async (req: Request, context: any) => {
    const startTime = Date.now();
    let res: Response;
    let err: any = null;
    let resBody: any = undefined;

    // Clone request before it is consumed by the handler
    let logReq = req;
    try {
      logReq = req.clone();
    } catch (e) {
      // Ignore clone failure
    }

    try {
      res = await handler(req, context);
      
      // Attempt to inspect response body
      try {
        const clonedRes = res.clone();
        const text = await clonedRes.text();
        resBody = text;
        try {
          resBody = JSON.parse(text);
        } catch {}
      } catch (e) {}

    } catch (e) {
      err = e;
      res = NextResponse.json(
        { code: "internal_error", message: "Internal server error." },
        { status: 500 }
      );
    }

    const duration = Date.now() - startTime;
    await logWcRequestResponse(logReq, res, duration, resBody);

    if (err) {
      throw err;
    }
    return res;
  };
}

