import { NextResponse } from "next/server";
import { db, ensureInitialized, pool } from "@/lib/db";
import { dockerServices } from "@/lib/db/schema";

const DEFAULT_SERVICES = [
  {
    name: "node-app",
    image: "node:24.16-alpine",
    tag: "latest",
    port: "80:3000",
    status: "running",
    network: "node-net",
    description: "Next.js 16 Web Application Frontend & Drizzle ORM container",
  },
  {
    name: "node-db",
    image: "mysql:8.0",
    tag: "8.0",
    port: "3306",
    status: "running",
    network: "node-net",
    description: "MySQL Relational Database Store with persistent db_data volume",
  },
  {
    name: "node-pma",
    image: "phpmyadmin:latest",
    tag: "latest",
    port: "8080:80",
    status: "running",
    network: "node-net",
    description: "Database Admin Visualizer & Inspection Dashboard",
  },
  {
    name: "redis-cache",
    image: "redis:7.4-alpine",
    tag: "alpine",
    port: "6379:6379",
    status: "stopped",
    network: "node-net",
    description: "In-memory session & transient cache tier",
  },
  {
    name: "nginx-proxy",
    image: "nginx:1.27-alpine",
    tag: "alpine",
    port: "443:443",
    status: "stopped",
    network: "node-net",
    description: "Edge reverse proxy and SSL termination gateway",
  },
];

export async function POST(request: Request) {
  await ensureInitialized();

  try {
    const url = new URL(request.url);
    const action = url.searchParams.get("action");

    if (action === "clear") {
      await pool.query("TRUNCATE TABLE docker_services");
      return NextResponse.json({
        success: true,
        message: "All services cleared from database",
      });
    }

    // Default: Reset/Seed demo services
    await pool.query("TRUNCATE TABLE docker_services");
    await db.insert(dockerServices).values(DEFAULT_SERVICES);

    const items = await db.select().from(dockerServices);

    return NextResponse.json({
      success: true,
      message: `Reset database with ${items.length} demo services`,
      data: items,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
