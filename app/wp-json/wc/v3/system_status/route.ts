// app/wp-json/wc/v3/system_status/route.ts
import { NextResponse } from "next/server";
import { wcAuthenticate } from "@/lib/wc-auth";

export const dynamic = "force-dynamic";

/**
 * GET /wp-json/wc/v3/system_status
 */
export async function GET(req: Request) {
  const authResult = await wcAuthenticate(req, "read");
  if (!authResult.authenticated) {
    return authResult.errorResponse!;
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  return NextResponse.json({
    environment: {
      home_url: appUrl,
      site_url: appUrl,
      version: "3.8.0", // Mimic common WC version
      log_directory: "app/logs",
      log_directory_writable: true,
      wp_version: "6.4.2", // Mimic WordPress version
      wp_multisite: false,
      wp_memory_limit: 268435456,
      wp_debug_mode: false,
      wp_cron: true,
      language: "en_US",
      server_info: `Next.js 16 (React 19, Node.js ${process.version})`,
      php_version: "8.2.0",
      php_post_max_size: 104857600,
      php_max_execution_time: 300,
      php_max_input_vars: 1000,
      curl_version: "7.85.0 OpenSSL/3.0.8",
      suhosin_installed: false,
      max_upload_size: 104857600,
      mysql_version: "PostgreSQL (Prisma adapter client)",
      mysql_version_string: "PostgreSQL",
      default_timezone: "UTC",
      fsockopen_or_curl_enabled: true,
      soapclient_enabled: false,
      domdocument_enabled: true,
      gzip_enabled: true,
      multibyte_string_enabled: true,
    },
    database: {
      database_prefix: "wp_",
      database_char_set: "utf8",
      database_collate_set: "utf8_general_ci",
      database_size: {
        data: "2.5MB",
        index: "1.2MB",
        total: "3.7MB",
      },
    },
    security: {
      connection_secure: appUrl.startsWith("https"),
      hide_errors: true,
    },
  });
}
