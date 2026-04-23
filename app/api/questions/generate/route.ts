import { NextResponse } from "next/server";
import { buildQuestionPrompt } from "@/lib/services/questions.service";

export async function POST(request: Request) {
  const body = await request.json();

  return NextResponse.json({
    ok: true,
    prompt: buildQuestionPrompt({
      examType: body.examType ?? "JAMB",
      examName: body.examName ?? "UTME",
      subject: body.subject ?? "Mathematics",
      topicList: body.topicList ?? ["Algebra"],
      count: body.count ?? 10
    })
  });
}

