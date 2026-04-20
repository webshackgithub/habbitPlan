import { PrismaClient } from "../../generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { createClient as createLibSqlClient } from "@libsql/client";

const globalForPrisma = global as unknown as { prisma?: PrismaClient };

const getPrisma = async () => {
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
  // 운영 환경에서 better-sqlite3가 로드되어 프로세스가 죽는 것을 방지하기 위해 동적 임포트를 사용합니다.
  const { PrismaBetterSqlite3 } = await import("@prisma/adapter-better-sqlite3");
  const path = await import("path");

  const dbPath = path.resolve(process.cwd(), "dev.db");
  const connectionString = dbUrl || `file:${dbPath}`;
  
  // Prisma Engine이 로컬 경로를 인식하도록 설정
  process.env.DATABASE_URL = connectionString;
  
  const adapter = new PrismaBetterSqlite3({ url: connectionString });
  console.log(`🏠 Running in Local Mode (SQLite): ${connectionString}`);
  return new PrismaClient({ adapter });
};

// getPrisma가 비동기로 변경됨에 따라, prisma 인스턴스 생성을 관리하는 방식을 조정할 필요가 있을 수 있으나
// 여기서는 기본 골격을 유지합니다. 싱글톤 패턴 유지를 위해 즉시 실행하거나, 사용 시점에 await 하도록 유도합니다.
// (참고: Server Action이나 API Route에서 사용 시 await prisma 처리가 필요할 수 있음)
export const prisma = globalForPrisma.prisma || (await getPrisma());

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
