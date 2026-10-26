import path from "node:path";
import { PrismaClient } from "@prisma/client";
import { PrismaBetterSQLite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaPg } from "@prisma/adapter-pg";

/**
 * Prisma client using driver adapters. SQLite for local development,
 * PostgreSQL for production (selected from the DATABASE_URL scheme).
 * The `provider` in prisma/schema.prisma must match.
 */
function createClient() {
  const url = process.env.DATABASE_URL ?? "file:./dev.db";
  if (url.startsWith("postgres")) {
    return new PrismaClient({ adapter: new PrismaPg({ connectionString: url }) });
  }
  // Relative SQLite paths are relative to the prisma/ folder (same as the Prisma CLI).
  const file = url.replace(/^file:/, "");
  const abs = path.isAbsolute(file) ? file : path.resolve(process.cwd(), "prisma", file);
  return new PrismaClient({ adapter: new PrismaBetterSQLite3({ url: `file:${abs}` }) });
}

const globalForPrisma = globalThis as unknown as { prisma?: ReturnType<typeof createClient> };
export const db = globalForPrisma.prisma ?? createClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;

/** SQLite string filters are already case-insensitive; PostgreSQL needs mode: "insensitive". */
export const insensitive = (process.env.DATABASE_URL ?? "").startsWith("postgres") ? ({ mode: "insensitive" } as const) : ({} as Record<string, never>);
