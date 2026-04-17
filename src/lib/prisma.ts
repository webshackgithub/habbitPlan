import "dotenv/config";
import { PrismaClient } from "../../generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { createClient as createLibSqlClient } from "@libsql/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import path from "path";

const globalForPrisma = global as unknown as { prisma?: PrismaClient };

const getPrisma = () => {
  // Bracket notation을 사용하여 빌드 타임의 정적 치환을 방어합니다.
  const runtimeEnv = process.env;
  const dbUrl = runtimeEnv["DATABASE_URL"];
  const authToken = runtimeEnv["TURSO_AUTH_TOKEN"];

  // 1. Turso 모드 (운영 환경: 토큰이 존재하는 경우)
  if (authToken && authToken !== "undefined" && authToken !== "") {
    const finalDbUrl = dbUrl || "libsql://default";
    const libsql = createLibSqlClient({
      url: finalDbUrl,
      authToken: authToken,
    });
    
    // Prisma 7 Engine이 런타임에 DATABASE_URL을 참조할 수 있도록 실제 환경 변수를 강제로 덮어씌웁니다.
    process.env.DATABASE_URL = finalDbUrl;
    
    const adapter = new PrismaLibSql(libsql as any);
    console.log(`🌐 Running in Production Mode (Turso): ${finalDbUrl}`);
    
    return new PrismaClient({ adapter });
  }

  // 2. 로컬 모드 (개발 환경: 토큰이 없는 경우)
  const dbPath = path.resolve(process.cwd(), "dev.db");
  const connectionString = dbUrl || `file:${dbPath}`;
  
  // Prisma Engine이 로컬 경로를 인식하도록 설정
  process.env.DATABASE_URL = connectionString;
  
  const adapter = new PrismaBetterSqlite3({ url: connectionString });
  console.log(`🏠 Running in Local Mode (SQLite): ${connectionString}`);
  return new PrismaClient({ adapter });
};

export const prisma = globalForPrisma.prisma || getPrisma();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
