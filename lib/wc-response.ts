// lib/wc-response.ts

export function wcResponse(data: any, status = 200, headers: Record<string, string> = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  });
}

export function wcError(code: string, message: string, status = 400, additionalData: any = {}) {
  return wcResponse(
    {
      code,
      message,
      data: {
        status,
        ...additionalData,
      },
    },
    status
  );
}

export function wcUnauthorized(message = "Unauthorized request") {
  return wcError("woocommerce_rest_authentication_error", message, 401);
}

export function wcForbidden(message = "The API key provided does not have permissions to perform this operation.") {
  return wcError("woocommerce_rest_cannot_view", message, 403);
}

export function wcNotFound(message = "Resource not found") {
  return wcError("woocommerce_rest_invalid_id", message, 404);
}
