import { NextResponse } from "next/server";
import { startMockExam } from "@/lib/services/mockExam.service";

export async function POST(request: Request) {
  const body = await request.json();
  const mock = await startMockExam(body.userId ?? "demo-user", body.subjects ?? ["Mathematics", "English"]);
  return NextResponse.json(mock);
}

