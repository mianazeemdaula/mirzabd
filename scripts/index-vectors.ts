// scripts/index-vectors.ts
import { loadEnvConfig } from "@next/env";
// Force environment variable loading before any database imports are executed
loadEnvConfig(process.cwd());

async function main() {
  console.log("Pre-indexing vectors for local semantic search RAG...");
  try {
    // Dynamically import RAG module after environment variables are loaded in process.env
    const { loadOrUpdateCache } = await import("../lib/rag");
    await loadOrUpdateCache(true);
    console.log("Vector pre-indexing complete!");
    process.exit(0);
  } catch (err) {
    console.error("Failed to pre-index vectors:", err);
    process.exit(1);
  }
}

main();
