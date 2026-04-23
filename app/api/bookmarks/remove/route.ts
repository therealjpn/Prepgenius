import { NextResponse } from "next/server";
import { removeBookmark } from "@/lib/services/bookmarks.service";

export async function POST(request: Request) {
  const body = await request.json();
  const result = await removeBookmark(body.questionId ?? "q_math_1");
  return NextResponse.json(result);
}

