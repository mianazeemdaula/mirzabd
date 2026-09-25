// lib/prisma.ts
import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

// Vector cache rebuilds re-read and re-embed the whole catalog, so product writes are
// coalesced: a POS batch of hundreds of updates causes one rebuild after writes go quiet,
// and rebuilds never overlap.
const VECTOR_REBUILD_DELAY_MS = 30_000;

const vectorState = globalThis as unknown as {
  vectorRebuildTimer?: ReturnType<typeof setTimeout>;
  vectorRebuildRunning?: boolean;
  vectorRebuildPending?: boolean;
};

function triggerVectorUpdate() {
  if (vectorState.vectorRebuildTimer) clearTimeout(vectorState.vectorRebuildTimer);
  vectorState.vectorRebuildTimer = setTimeout(runVectorRebuild, VECTOR_REBUILD_DELAY_MS);
}

async function runVectorRebuild() {
  vectorState.vectorRebuildTimer = undefined;
  if (vectorState.vectorRebuildRunning) {
    vectorState.vectorRebuildPending = true;
    return;
  }
  vectorState.vectorRebuildRunning = true;
  try {
    const { loadOrUpdateCache } = await import("@/lib/rag");
    await loadOrUpdateCache(true);
  } catch (err) {
    console.error("Vector cache rebuild failed:", err);
  } finally {
    vectorState.vectorRebuildRunning = false;
    if (vectorState.vectorRebuildPending) {
      vectorState.vectorRebuildPending = false;
      triggerVectorUpdate();
    }
  }
}

function createPrismaClient() {
  const connectionString =
    process.env.DATABASE_URL || "mysql://localhost:3306/book_depot";
  const adapter = new PrismaMariaDb(connectionString);

  const rawPrisma = new PrismaClient({
    adapter,
    // SQL logging floods the dev console; opt in with PRISMA_LOG_QUERIES=true when debugging
    log:
      process.env.PRISMA_LOG_QUERIES === "true"
        ? ["query", "error", "warn"]
        : process.env.NODE_ENV === "development"
          ? ["error", "warn"]
          : ["error"],
  });

  return rawPrisma.$extends({
    query: {
      product: {
        async create({ args, query }) {
          const result = await query(args);
          triggerVectorUpdate();
          return result;
        },
        async update({ args, query }) {
          const result = await query(args);
          triggerVectorUpdate();
          return result;
        },
        async delete({ args, query }) {
          const result = await query(args);
          triggerVectorUpdate();
          return result;
        },
        async upsert({ args, query }) {
          const result = await query(args);
          triggerVectorUpdate();
          return result;
        },
        async createMany({ args, query }) {
          const result = await query(args);
          triggerVectorUpdate();
          return result;
        },
        async updateMany({ args, query }) {
          const result = await query(args);
          triggerVectorUpdate();
          return result;
        },
        async deleteMany({ args, query }) {
          const result = await query(args);
          triggerVectorUpdate();
          return result;
        },
      },
    },
  });
}

type ExtendedPrismaClient = ReturnType<typeof createPrismaClient>;

const globalForPrisma = globalThis as unknown as {
  prisma: ExtendedPrismaClient | undefined;
};

const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;

