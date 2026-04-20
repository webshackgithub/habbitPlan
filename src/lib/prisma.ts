import { PrismaClient } from "../../generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { createClient as createLibSqlClient } from "@libsql/client";

const globalForPrisma = global as unknown as { prisma?: PrismaClient };

async function buildPrismaClient(): Promise<PrismaClient> {
  const dbUrl = process.env["DATABASE_URL"];
  const authToken = process.env["TURSO_AUTH_TOKEN"];

  // 1. 운영 모드: Turso / libsql
  if (authToken && authToken !== "undefined" && authToken !== "") {
    const finalDbUrl = dbUrl || "libsql://default";
    const libsql = createLibSqlClient({
      url: finalDbUrl,
      authToken,
    });
    const adapter = new PrismaLibSql(libsql as any);
    console.log(`🌐 Running in Production Mode (Turso): ${finalDbUrl}`);
    return new PrismaClient({ adapter });
  }

  // 2. 로컬/개발 모드: better-sqlite3 lll
  const { PrismaBetterSqlite3 } = await import("@prisma/adapter-better-sqlite3");
  const path = await import("path");
  const dbPath = path.resolve(process.cwd(), "dev.db");
  const connectionString = dbUrl || `file:${dbPath}`;
  const adapter = new PrismaBetterSqlite3({ url: connectionString });
  console.log(`🏠 Running in Local Mode (SQLite): ${connectionString}`);
  return new PrismaClient({ adapter });
}

// 첫 번째 속성 접근 시 한 번만 실행되는 싱글톤 Promise
let clientPromise: Promise<PrismaClient> | null = null;

function getClientPromise(): Promise<PrismaClient> {
  if (globalForPrisma.prisma) {
    return Promise.resolve(globalForPrisma.prisma);
  }
  if (!clientPromise) {
    clientPromise = buildPrismaClient().then((client) => {
      if (process.env.NODE_ENV !== "production") {
        globalForPrisma.prisma = client;
      }
      return client;
    });
  }
  return clientPromise;
}

// Proxy를 통해 기존 prisma.habit.findMany() 호출 방식을 그대로 유지하면서
// 실제 클라이언트 초기화는 첫 요청 시점까지 지연시킴
function makeClientProxy(): PrismaClient {
  return new Proxy({} as PrismaClient, {
    get(_target, modelProp: string | symbol) {
      // then을 undefined로 반환하여 Proxy가 Promise로 오인되는 것을 방지
      if (typeof modelProp === "symbol" || modelProp === "then") {
        return undefined;
      }

      return new Proxy(
        {},
        {
          get(_modelTarget, methodProp: string | symbol) {
            if (typeof methodProp === "symbol") return undefined;

            return (...args: unknown[]) =>
              getClientPromise().then((client) => {
                const model = (client as any)[modelProp];
                if (!model || typeof model[methodProp] !== "function") {
                  throw new TypeError(
                    `prisma.${String(modelProp)}.${String(methodProp)} is not a function`
                  );
                }
                return model[methodProp](...args);
              });
          },
        }
      );
    },
  });
}

export const prisma: PrismaClient = makeClientProxy();
