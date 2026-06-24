// lib/wc-auth.ts
import prisma from "@/lib/prisma";
import { logWcApi } from "@/lib/logger";

export interface WcAuthResult {
  authenticated: boolean;
  permissions?: string;
  errorResponse?: Response;
}

/**
 * Authenticates a WooCommerce REST API request.
 * Supports HTTP Basic Auth header and query parameters (consumer_key / consumer_secret).
 */
export async function wcAuthenticate(
  request: Request,
  requiredPermission: "read" | "write"
): Promise<WcAuthResult> {
  try {
    let consumerKey: string | null = null;
    let consumerSecret: string | null = null;

    // 1. Check HTTP Basic Authentication Header
    const authHeader = request.headers.get("Authorization");
    if (authHeader && authHeader.startsWith("Basic ")) {
      const base64Credentials = authHeader.substring(6);
      const credentials = Buffer.from(base64Credentials, "base64").toString("ascii");
      const parts = credentials.split(":");
      if (parts.length === 2) {
        consumerKey = parts[0];
        consumerSecret = parts[1];
      }
    }

    // 2. Check query string parameters if header is missing
    if (!consumerKey || !consumerSecret) {
      const { searchParams } = new URL(request.url);
      consumerKey = searchParams.get("consumer_key");
      consumerSecret = searchParams.get("consumer_secret");
    }

    if (!consumerKey || !consumerSecret) {
      logWcApi("WARNING", "AUTHENTICATION", `Consumer key and/or consumer secret is missing from request. Method: ${request.method} | URL: ${request.url}`);
      return {
        authenticated: false,
        errorResponse: new Response(
          JSON.stringify({
            code: "woocommerce_rest_authentication_error",
            message: "Consumer key and/or consumer secret is missing.",
            data: { status: 401 },
          }),
          { status: 401, headers: { "Content-Type": "application/json" } }
        ),
      };
    }

    // 3. Look up credentials in the database
    const apiCred = await prisma.apiCredential.findUnique({
      where: { consumerKey },
    });

    if (!apiCred || !apiCred.isActive || apiCred.consumerSecret !== consumerSecret) {
      logWcApi("WARNING", "AUTHENTICATION", `Invalid authentication credentials attempted. Consumer Key: "${consumerKey}" | Method: ${request.method} | URL: ${request.url}`);
      return {
        authenticated: false,
        errorResponse: new Response(
          JSON.stringify({
            code: "woocommerce_rest_authentication_error",
            message: "Invalid consumer key and/or consumer secret.",
            data: { status: 401 },
          }),
          { status: 401, headers: { "Content-Type": "application/json" } }
        ),
      };
    }

    // 4. Check permissions
    // "read_write" can do everything. "read" can only do GET. "write" can do POST/PUT/DELETE.
    const isAuthorized =
      apiCred.permissions === "read_write" ||
      (requiredPermission === "read" && apiCred.permissions === "read") ||
      (requiredPermission === "write" && apiCred.permissions === "write");

    if (!isAuthorized) {
      logWcApi(
        "WARNING",
        "AUTHENTICATION",
        `Unauthorized access attempt. Key: "${apiCred.description}" (${apiCred.consumerKey}) has permissions: "${apiCred.permissions}", but operation requires: "${requiredPermission}". Method: ${request.method} | URL: ${request.url}`
      );
      return {
        authenticated: false,
        errorResponse: new Response(
          JSON.stringify({
            code: "woocommerce_rest_cannot_view",
            message: "The API key provided does not have permissions to perform this operation.",
            data: { status: 401 },
          }),
          { status: 401, headers: { "Content-Type": "application/json" } }
        ),
      };
    }

    // 5. Update last used timestamp in background
    prisma.apiCredential
      .update({
        where: { id: apiCred.id },
        data: { lastUsedAt: new Date() },
      })
      .catch((err) => {
        logWcApi("ERROR", "DATABASE", `Failed to update ApiCredential lastUsedAt for key: ${apiCred.id}`, err);
        console.error("Failed to update ApiCredential lastUsedAt:", err);
      });

    logWcApi("INFO", "AUTHENTICATION", `Authenticated: "${apiCred.description}" (${apiCred.permissions}) | Method: ${request.method} | URL: ${request.url}`);

    return {
      authenticated: true,
      permissions: apiCred.permissions,
    };
  } catch (error) {
    logWcApi("ERROR", "AUTHENTICATION", "An internal error occurred during authentication validation.", error);
    console.error("Authentication check error:", error);
    return {
      authenticated: false,
      errorResponse: new Response(
        JSON.stringify({
          code: "woocommerce_rest_authentication_error",
          message: "An internal error occurred during authentication validation.",
          data: { status: 500 },
         }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      ),
    };
  }
}
