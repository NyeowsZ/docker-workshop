import { NextResponse } from "next/server";
import { db, ensureInitialized } from "@/lib/db";
import { quizQuestions } from "@/lib/db/schema";
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
    const updateData: Partial<typeof quizQuestions.$inferInsert> = {};

    if (body.question !== undefined) updateData.question = body.question.trim();
    if (body.optionA !== undefined) updateData.optionA = body.optionA.trim();
    if (body.optionB !== undefined) updateData.optionB = body.optionB.trim();
    if (body.optionC !== undefined) updateData.optionC = body.optionC.trim();
    if (body.optionD !== undefined) updateData.optionD = body.optionD.trim();
    if (body.correctAnswer !== undefined) updateData.correctAnswer = body.correctAnswer.trim().toUpperCase();
    if (body.explanation !== undefined) updateData.explanation = body.explanation.trim();
    if (body.category !== undefined) updateData.category = body.category.trim();

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ success: false, error: "No fields to update" }, { status: 400 });
    }

    await db.update(quizQuestions).set(updateData).where(eq(quizQuestions.id, id));

    const updated = await db.select().from(quizQuestions).where(eq(quizQuestions.id, id));

    if (updated.length === 0) {
      return NextResponse.json({ success: false, error: "Question not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Question updated successfully",
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
    const existing = await db.select().from(quizQuestions).where(eq(quizQuestions.id, id));

    if (existing.length === 0) {
      return NextResponse.json({ success: false, error: "Question not found" }, { status: 404 });
    }

    await db.delete(quizQuestions).where(eq(quizQuestions.id, id));

    return NextResponse.json({
      success: true,
      message: `Question #${id} deleted successfully`,
      data: existing[0],
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
