// lib/rag.ts
import fs from "fs";
import path from "path";
import prisma from "@/lib/prisma";

let extractor: any = null;

// Configure Hugging Face transformers cache to store the model locally inside the project directory
async function getExtractor() {
  if (!extractor) {
    const { env, pipeline } = await import("@huggingface/transformers");
    
    // Set local cache directory for the ONNX model files
    env.cacheDir = path.join(process.cwd(), ".cache", "transformers");
    env.allowLocalModels = false; // Disable local filesystem model search, force remote download if cache miss
    env.allowRemoteModels = true; // Allow downloading from Hugging Face Hub if cache miss

    // Use all-MiniLM-L6-v2 (a very lightweight, accurate, 384-dimensional semantic embedding model)
    extractor = await pipeline("feature-extraction", "onnx-community/all-MiniLM-L6-v2-ONNX", {
      device: "cpu", // Ensure WASM CPU execution for general compatibility
    });
  }
  return extractor;
}

// Generate embedding vector for a given text
export async function getEmbedding(text: string): Promise<number[]> {
  try {
    const pipe = await getExtractor();
    const output = await pipe(text, { pooling: "mean", normalize: true });
    return Array.from(output.data);
  } catch (error) {
    console.error("Failed to generate embedding:", error);
    throw error;
  }
}

// Cosine similarity of two normalized vectors (since they are normalized, it is just the dot product)
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;
  let dotProduct = 0;
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
  }
  return dotProduct;
}

interface CacheItem {
  id: string;      // "kb-1", "p-12"
  text: string;    // Text content
  metadata: any;   // Extra details (slug, title, type)
  vector: number[];// Float array embedding
}

const CACHE_FILE_PATH = path.join(process.cwd(), "vector-cache.json");

// Helper to chunk the markdown knowledge base by sections (using headers '##' or '###')
function getKnowledgeBaseChunks(): { text: string; title: string }[] {
  try {
    const kbPath = path.join(process.cwd(), "chatbot-info.md");
    if (!fs.existsSync(kbPath)) return [];
    
    const content = fs.readFileSync(kbPath, "utf-8");
    const lines = content.split("\n");
    const chunks: { text: string; title: string }[] = [];
    
    let currentTitle = "General Store Information";
    let currentChunk: string[] = [];

    for (const line of lines) {
      if (line.startsWith("## ") || line.startsWith("### ")) {
        // Save previous chunk
        if (currentChunk.length > 0) {
          chunks.push({
            title: currentTitle,
            text: currentChunk.join("\n").trim(),
          });
        }
        currentTitle = line.replace(/^#+\s+/, "").trim();
        currentChunk = [line];
      } else if (line.trim() !== "" || currentChunk.length > 0) {
        currentChunk.push(line);
      }
    }
    
    if (currentChunk.length > 0) {
      chunks.push({
        title: currentTitle,
        text: currentChunk.join("\n").trim(),
      });
    }
    
    return chunks;
  } catch (err) {
    console.error("Error reading knowledge base chunks:", err);
    return [];
  }
}

// Global in-memory cache to prevent file reads/Prisma queries on hot serverless requests
const globalForRAG = globalThis as unknown as {
  vectorCache: CacheItem[] | undefined;
};

// Generate or load embeddings cache
export async function loadOrUpdateCache(forceRefresh = false): Promise<CacheItem[]> {
  try {
    // 1. Check in-memory cache first if not forcing refresh
    if (!forceRefresh && globalForRAG.vectorCache && globalForRAG.vectorCache.length > 0) {
      // Validate that our cache matches the database count in the background
      verifyAndSyncCacheInBackground();
      return globalForRAG.vectorCache;
    }

    let fileCache: CacheItem[] = [];
    let dbCacheItems: CacheItem[] = [];

    // 2. Try loading from local file if not forcing refresh
    if (!forceRefresh && fs.existsSync(CACHE_FILE_PATH)) {
      try {
        const data = fs.readFileSync(CACHE_FILE_PATH, "utf-8");
        fileCache = JSON.parse(data);
      } catch (fileErr) {
        console.warn("Failed to parse vector cache from file.", fileErr);
      }
    }

    // 3. Try loading from database Setting table if not forcing refresh
    if (!forceRefresh) {
      try {
        const dbCache = await prisma.setting.findUnique({
          where: { key: "vector_cache" },
        });
        if (dbCache && dbCache.value) {
          dbCacheItems = dbCache.value as unknown as CacheItem[];
        }
      } catch (dbLoadErr) {
        console.warn("Failed to load vector cache from database Setting table.");
      }
    }

    // Determine the best loaded cache
    const loadedCache = dbCacheItems.length > fileCache.length ? dbCacheItems : fileCache;

    if (!forceRefresh && loadedCache.length > 0) {
      globalForRAG.vectorCache = loadedCache;
      // Validate database count in background to auto-sync environment changes
      verifyAndSyncCacheInBackground();
      return loadedCache;
    }

    console.log("Generating semantic search embeddings cache...");
    const cacheItems: CacheItem[] = [];

    // 1. Process chatbot-info.md chunks
    const kbChunks = getKnowledgeBaseChunks();
    for (let i = 0; i < kbChunks.length; i++) {
      const chunk = kbChunks[i];
      const textToEmbed = `Topic: ${chunk.title}\nContent:\n${chunk.text}`;
      const vector = await getEmbedding(textToEmbed);
      
      cacheItems.push({
        id: `kb-${i}`,
        text: chunk.text,
        metadata: {
          type: "knowledge_base",
          title: chunk.title,
        },
        vector,
      });
    }

    // 2. Process all published products (with fail-safe fallback for build time/no DB connection)
    let products: any[] = [];
    try {
      products = await prisma.product.findMany({
        where: { status: "publish" },
        select: {
          id: true,
          name: true,
          slug: true,
          author: true,
          regularPrice: true,
          salePrice: true,
          description: true,
          shortDescription: true,
        },
      });

      for (const prod of products) {
        const authorText = prod.author ? ` by ${prod.author}` : "";
        const priceText = prod.salePrice 
          ? `Regular Price: Rs. ${prod.regularPrice}, Sale Price: Rs. ${prod.salePrice}`
          : `Price: Rs. ${prod.regularPrice}`;
          
        const textToEmbed = `Product Name: ${prod.name}${authorText}\n${priceText}\nDescription: ${prod.shortDescription || prod.description || ""}`;
        const vector = await getEmbedding(textToEmbed);

        cacheItems.push({
          id: `p-${prod.id}`,
          text: prod.name,
          metadata: {
            type: "product",
            id: prod.id,
            name: prod.name,
            slug: prod.slug,
            author: prod.author,
            price: prod.salePrice ? Number(prod.salePrice) : Number(prod.regularPrice),
          },
          vector,
        });
      }
    } catch (dbErr) {
      console.warn("Database connection not available during vector caching (typical during build environment). Continuing with static knowledge base only.", dbErr);
    }

    // Store in global memory reference
    globalForRAG.vectorCache = cacheItems;

    // Write to local cache file if we are in a writable environment
    try {
      fs.writeFileSync(CACHE_FILE_PATH, JSON.stringify(cacheItems, null, 2), "utf-8");
      console.log(`Successfully generated and cached ${cacheItems.length} vectors to file.`);
    } catch (writeErr) {
      console.warn("Unable to write vector cache to local file (likely serverless environment). Saving to DB settings table instead.");
      try {
        // Fallback: Store the vector cache as JSON directly in database Settings table
        await prisma.setting.upsert({
          where: { key: "vector_cache" },
          update: { value: cacheItems as any },
          create: { key: "vector_cache", value: cacheItems as any },
        });
        console.log("Vector cache successfully persisted to database Settings table.");
      } catch (dbSaveErr) {
        console.error("Failed to persist vector cache to database Settings table.", dbSaveErr);
      }
    }

    return cacheItems;
  } catch (error) {
    console.error("Failed to load or update vector cache:", error);
    return [];
  }
}

// Background utility to compare the database product count with cached count, and trigger async sync on mismatch
function verifyAndSyncCacheInBackground() {
  // Prevent multiple simultaneous checks
  if ((globalThis as any)._isCheckingCache) return;
  (globalThis as any)._isCheckingCache = true;

  setTimeout(async () => {
    try {
      const currentDbProductCount = await prisma.product.count({
        where: { status: "publish" },
      });
      
      const cache = globalForRAG.vectorCache || [];
      const cacheProductCount = cache.filter((item) => item.metadata.type === "product").length;

      if (cacheProductCount !== currentDbProductCount) {
        console.log(`Vector cache out of sync (Cache: ${cacheProductCount}, DB: ${currentDbProductCount}). Rebuilding in background...`);
        await loadOrUpdateCache(true);
        console.log("Background vector cache rebuild complete!");
      }
    } catch (err) {
      // Fail silently in the background
      console.warn("Background vector cache verification check skipped (no database connection).");
    } finally {
      (globalThis as any)._isCheckingCache = false;
    }
  }, 1000); // Small delay to let initial requests return quickly
}

// Run semantic similarity search over knowledge base & products
export async function semanticSearch(
  query: string,
  options: {
    limitKb?: number;
    limitProducts?: number;
    minScore?: number;
  } = {}
) {
  const { limitKb = 3, limitProducts = 5, minScore = 0.35 } = options;
  
  try {
    const queryVector = await getEmbedding(query);
    const cache = await loadOrUpdateCache();

    const scored = cache.map((item) => {
      const similarity = cosineSimilarity(queryVector, item.vector);
      return {
        id: item.id,
        text: item.text,
        metadata: item.metadata,
        score: similarity,
      };
    });

    // Filter and sort
    const kbMatches = scored
      .filter((item) => item.metadata.type === "knowledge_base" && item.score >= minScore)
      .sort((a, b) => b.score - a.score)
      .slice(0, limitKb);

    const productMatches = scored
      .filter((item) => item.metadata.type === "product" && item.score >= minScore)
      .sort((a, b) => b.score - a.score)
      .slice(0, limitProducts);

    return {
      knowledgeBase: kbMatches.map((m) => ({ title: m.metadata.title, text: m.text, score: m.score })),
      products: productMatches.map((m) => ({ ...m.metadata, score: m.score })),
    };
  } catch (error) {
    console.error("Semantic search failed:", error);
    return { knowledgeBase: [], products: [] };
  }
}
