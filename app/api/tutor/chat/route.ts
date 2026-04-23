import { NextResponse } from "next/server";
import { chatWithTutor } from "@/lib/services/tutor.service";

export async function POST(request: Request) {
  const body = await request.json();
  const response = await chatWithTutor({
    userId: body.userId ?? "demo-user",
    subject: body.subject ?? "Mathematics",
    prompt: body.prompt ?? "Explain quadratic equations."
  });

  return NextResponse.json(response);
}

