import { NextResponse } from "next/server";
import { submitPracticeAnswer } from "@/lib/services/practice.service";

export async function POST(request: Request) {
  const body = await request.json();
  const result = await submitPracticeAnswer({
    sessionId: body.sessionId,
    questionId: body.questionId,
    selectedAnswer: body.selectedAnswer
  });

  return NextResponse.json(result);
}

