import { NextResponse } from "next/server";
import { getQuestions } from "@/lib/services/questions.service";

export async function POST(request: Request) {
  const body = await request.json();
  const questions = await getQuestions({
    examType: body.examType ?? "jamb",
    subject: body.subject,
    topic: body.topic,
    count: body.count ?? 10
  });

  return NextResponse.json({ questions });
}

