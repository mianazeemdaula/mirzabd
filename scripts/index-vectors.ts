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
    console.warn("Notice: Vector pre-indexing skipped during build (will index at runtime):", err);
    process.exit(0);
  }
}

main();
