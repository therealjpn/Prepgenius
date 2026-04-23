import { NextResponse } from "next/server";
import { getPracticeSession, startPracticeSession } from "@/lib/services/practice.service";

export async function POST(request: Request) {
  const body = await request.json();
  const session = await startPracticeSession({
    userId: body.userId ?? "demo-user",
    platform: body.platform ?? "web",
    examType: body.examType ?? "jamb",
    subject: body.subject ?? "Mathematics",
    topic: body.topic ?? "Quadratic Equations"
  });

  return NextResponse.json(session);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get("sessionId");

  if (!sessionId) {
    return NextResponse.json({ error: "sessionId is required" }, { status: 400 });
  }

  const session = await getPracticeSession(sessionId);
  return NextResponse.json({ session });
}

