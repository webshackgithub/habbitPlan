import "dotenv/config";
import path from "path";
import { PrismaClient } from "../../generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

// 절대 경로 생성하여 경로 해석 오류 방지
const dbPath = path.resolve(process.cwd(), "dev.db");
const connectionString = process.env.DATABASE_URL || `file:${dbPath}`;

// Prisma 7 with Driver Adapter for SQLite
const adapter = new PrismaBetterSqlite3({ url: connectionString });

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter,
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
