import { NextResponse } from "next/server";
import { submitMockExam } from "@/lib/services/mockExam.service";

export async function POST(request: Request) {
  const body = await request.json();
  const report = await submitMockExam(body.totalQuestions ?? 40, body.correctAnswers ?? 26);
  return NextResponse.json(report);
}

