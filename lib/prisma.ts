// lib/prisma.ts
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
const adapter = new PrismaPg(pool);

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

const rawPrisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

const prisma = rawPrisma.$extends({
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

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = rawPrisma;
}

export default prisma;
