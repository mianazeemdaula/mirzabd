// actions/wc-schema.ts
"use server";

import fs from "fs";
import path from "path";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { recordWcSchema, resetWcSchema } from "@/lib/wc-schema";

async function isAdmin() {
  const session = await auth();
  return (session?.user as { role?: string } | undefined)?.role === "ADMIN";
}

/** Clears the learned schema for one resource (or all when omitted). It is rebuilt from the next requests. */
export async function resetSchemaAction(resource?: string) {
  if (!(await isAdmin())) return { error: "Unauthorized" };

  try {
    await resetWcSchema(resource);
    revalidatePath("/admin/api-schema");
    return { success: true };
  } catch (error) {
    console.error("Failed to reset WC schema:", error);
    return { error: "Failed to reset schema." };
  }
}

/** Backfills the schema from the recent request log (logs/requests.json), if present on this server. */
export async function importSchemaFromLogsAction() {
  if (!(await isAdmin())) return { error: "Unauthorized" };

  const file = path.join(process.cwd(), "logs", "requests.json");
  if (!fs.existsSync(file)) return { error: "No request log found on this server." };

  try {
    const entries = JSON.parse(fs.readFileSync(file, "utf-8"));
    if (!Array.isArray(entries)) return { error: "Request log is not in the expected format." };

    let imported = 0;
    for (const entry of entries) {
      const status = Number(entry?.response?.statusCode);
      if (!entry?.url || !entry?.method || !(status >= 200 && status < 300)) continue;

      const url = new URL(entry.url);
      const body = typeof entry.body === "object" ? entry.body : null;
      await recordWcSchema(entry.method, url.pathname, url.searchParams, body);
      imported++;
    }

    revalidatePath("/admin/api-schema");
    return { success: true, imported };
  } catch (error) {
    console.error("Failed to import WC schema from logs:", error);
    return { error: "Failed to import from request log." };
  }
}
