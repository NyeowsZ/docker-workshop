import { NextResponse } from "next/server";
import { db, ensureInitialized, pool, DEFAULT_QUESTIONS } from "@/lib/db";
import { quizQuestions } from "@/lib/db/schema";

export async function POST() {
  await ensureInitialized();

  try {
    await pool.query("TRUNCATE TABLE quiz_questions");
    for (const q of DEFAULT_QUESTIONS) {
      await db.insert(quizQuestions).values({
        question: q.question,
        optionA: q.optionA,
        optionB: q.optionB,
        optionC: q.optionC,
        optionD: q.optionD,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        category: q.category,
      });
    }

    const items = await db.select().from(quizQuestions).orderBy(quizQuestions.id);

    return NextResponse.json({
      success: true,
      message: `Reset quiz with ${items.length} default Docker questions`,
      data: items,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
