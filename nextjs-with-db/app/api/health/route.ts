import { NextResponse } from "next/server";
import { pool, ensureInitialized } from "@/lib/db";
import os from "os";

export async function GET() {
  const startTime = Date.now();
  let dbStatus = "disconnected";
  let dbLatency = 0;
  let mysqlVersion = "unknown";
  let serviceCount = 0;
  let errorDetail: string | null = null;

  try {
    await ensureInitialized();
    const pingStart = Date.now();
    const [versionRows] = await pool.query<any[]>("SELECT VERSION() AS version");
    dbLatency = Date.now() - pingStart;
    dbStatus = "connected";
    mysqlVersion = versionRows[0]?.version || "8.0";

    const [countRows] = await pool.query<any[]>(
      "SELECT COUNT(*) AS total FROM docker_services"
    );
    serviceCount = countRows[0]?.total || 0;
  } catch (err: unknown) {
    dbStatus = "error";
    errorDetail = err instanceof Error ? err.message : String(err);
  }

  const memory = process.memoryUsage();

  return NextResponse.json({
    status: dbStatus === "connected" ? "healthy" : "degraded",
    timestamp: new Date().toISOString(),
    totalLatencyMs: Date.now() - startTime,
    container: {
      hostname: os.hostname(), // In docker, this is container ID!
      platform: `${os.platform()} (${os.arch()})`,
      nodeVersion: process.version,
      uptimeSeconds: Math.floor(process.uptime()),
      memoryRssMb: Math.round(memory.rss / (1024 * 1024)),
      memoryHeapMb: Math.round(memory.heapUsed / (1024 * 1024)),
    },
    database: {
      status: dbStatus,
      host: process.env.DB_HOST || "node-db",
      port: Number(process.env.DB_PORT) || 3306,
      name: process.env.DB_NAME || "nextdb",
      user: process.env.DB_USER || "root",
      version: mysqlVersion,
      latencyMs: dbLatency,
      recordCount: serviceCount,
      driver: "Drizzle ORM + mysql2",
      error: errorDetail,
    },
    services: {
      appUrl: "http://localhost:80 (or 3000)",
      pmaUrl: "http://localhost:8080",
    },
  });
}
