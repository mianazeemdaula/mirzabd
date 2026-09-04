// lib/prisma.ts
import { PrismaClient } from "@prisma/client";

// Helper to trigger vector cache updates in the background (non-blocking)
function triggerVectorUpdate() {
  import("@/lib/rag")
    .then(({ loadOrUpdateCache }) => {
      loadOrUpdateCache(true).catch((err) =>
        console.error("Prisma hook vector cache update failed:", err)
      );
    })
    .catch((err) => console.error("Failed to load RAG module in Prisma hook:", err));
}

function createPrismaClient() {
  const rawPrisma = new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
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

