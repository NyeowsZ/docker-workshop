import { NextResponse } from "next/server";
import { db, ensureInitialized } from "@/lib/db";
import { quizQuestions } from "@/lib/db/schema";
import { desc, like, or } from "drizzle-orm";

export async function GET(request: Request) {
  const startTime = Date.now();
  await ensureInitialized();

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search")?.trim();

  try {
    let query = db.select().from(quizQuestions);

    if (search) {
      query = db
        .select()
        .from(quizQuestions)
        .where(
          or(
            like(quizQuestions.question, `%${search}%`),
            like(quizQuestions.category, `%${search}%`)
          )
        )
        .orderBy(desc(quizQuestions.createdAt)) as typeof query;
    } else {
      query = db
        .select()
        .from(quizQuestions)
        .orderBy(quizQuestions.id) as typeof query;
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
      { success: false, error: message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  await ensureInitialized();

  try {
    const body = await request.json();
    const { question, optionA, optionB, optionC, optionD, correctAnswer, explanation, category } = body;

    if (!question || !optionA || !optionB || !optionC || !optionD || !correctAnswer) {
      return NextResponse.json(
        { success: false, error: "Question, 4 options, and correct answer (A/B/C/D) are required." },
        { status: 400 }
      );
    }

    const [result] = await db.insert(quizQuestions).values({
      question: question.trim(),
      optionA: optionA.trim(),
      optionB: optionB.trim(),
      optionC: optionC.trim(),
      optionD: optionD.trim(),
      correctAnswer: correctAnswer.trim().toUpperCase(),
      explanation: (explanation || "").trim(),
      category: (category || "Docker Core").trim(),
    });

    const insertId = (result as { insertId?: number }).insertId;

    return NextResponse.json(
      {
        success: true,
        message: "Question created successfully",
        data: { id: insertId, question, optionA, optionB, optionC, optionD, correctAnswer, explanation, category },
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
