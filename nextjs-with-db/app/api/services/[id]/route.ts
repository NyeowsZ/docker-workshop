import { NextResponse } from "next/server";
import { db, ensureInitialized } from "@/lib/db";
import { dockerServices } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  await ensureInitialized();
  const { id: rawId } = await context.params;
  const id = parseInt(rawId, 10);

  if (isNaN(id)) {
    return NextResponse.json({ success: false, error: "Invalid ID" }, { status: 400 });
  }

  try {
    const body = await request.json();
    const updateData: Partial<typeof dockerServices.$inferInsert> = {};

    if (body.name !== undefined) updateData.name = body.name.trim();
    if (body.image !== undefined) updateData.image = body.image.trim();
    if (body.tag !== undefined) updateData.tag = body.tag.trim();
    if (body.port !== undefined) updateData.port = body.port.trim();
    if (body.status !== undefined) updateData.status = body.status.trim();
    if (body.network !== undefined) updateData.network = body.network.trim();
    if (body.description !== undefined) updateData.description = body.description.trim();

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ success: false, error: "No fields provided to update" }, { status: 400 });
    }

    await db
      .update(dockerServices)
      .set(updateData)
      .where(eq(dockerServices.id, id));

    const updated = await db
      .select()
      .from(dockerServices)
      .where(eq(dockerServices.id, id));

    if (updated.length === 0) {
      return NextResponse.json({ success: false, error: "Service not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Service updated successfully",
      data: updated[0],
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  await ensureInitialized();
  const { id: rawId } = await context.params;
  const id = parseInt(rawId, 10);

  if (isNaN(id)) {
    return NextResponse.json({ success: false, error: "Invalid ID" }, { status: 400 });
  }

  try {
    const existing = await db
      .select()
      .from(dockerServices)
      .where(eq(dockerServices.id, id));

    if (existing.length === 0) {
      return NextResponse.json({ success: false, error: "Service not found" }, { status: 404 });
    }

    await db.delete(dockerServices).where(eq(dockerServices.id, id));

    return NextResponse.json({
      success: true,
      message: `Service ${id} deleted successfully`,
      data: existing[0],
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
