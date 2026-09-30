import { NextResponse } from "next/server";
import { db, ensureInitialized } from "@/lib/db";
import { dockerServices } from "@/lib/db/schema";
import { desc, eq, like, or } from "drizzle-orm";

export async function GET(request: Request) {
  const startTime = Date.now();
  await ensureInitialized();

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search")?.trim();
  const status = searchParams.get("status")?.trim();

  try {
    let query = db.select().from(dockerServices);

    if (search && status && status !== "all") {
      query = db
        .select()
        .from(dockerServices)
        .where(
          or(
            like(dockerServices.name, `%${search}%`),
            like(dockerServices.image, `%${search}%`),
            like(dockerServices.description, `%${search}%`)
          )
        )
        .orderBy(desc(dockerServices.createdAt)) as typeof query;
    } else if (search) {
      query = db
        .select()
        .from(dockerServices)
        .where(
          or(
            like(dockerServices.name, `%${search}%`),
            like(dockerServices.image, `%${search}%`),
            like(dockerServices.description, `%${search}%`)
          )
        )
        .orderBy(desc(dockerServices.createdAt)) as typeof query;
    } else if (status && status !== "all") {
      query = db
        .select()
        .from(dockerServices)
        .where(eq(dockerServices.status, status))
        .orderBy(desc(dockerServices.createdAt)) as typeof query;
    } else {
      query = db
        .select()
        .from(dockerServices)
        .orderBy(desc(dockerServices.createdAt)) as typeof query;
    }

    const items = await query;
    const latencyMs = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      data: items,
      meta: {
        count: items.length,
        latencyMs,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      {
        success: false,
        error: message,
        meta: { latencyMs: Date.now() - startTime },
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  await ensureInitialized();

  try {
    const body = await request.json();
    const { name, image, tag = "latest", port = "", status = "running", network = "node-net", description = "" } = body;

    if (!name || !image) {
      return NextResponse.json(
        { success: false, error: "Name and image are required fields." },
        { status: 400 }
      );
    }

    const [result] = await db.insert(dockerServices).values({
      name: name.trim(),
      image: image.trim(),
      tag: (tag || "latest").trim(),
      port: (port || "").trim(),
      status: (status || "running").trim(),
      network: (network || "node-net").trim(),
      description: (description || "").trim(),
    });

    const insertId = (result as { insertId?: number }).insertId;

    return NextResponse.json(
      {
        success: true,
        message: "Service created successfully",
        data: { id: insertId, name, image, tag, port, status, network, description },
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
