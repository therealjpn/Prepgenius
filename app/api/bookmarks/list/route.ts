import { NextResponse } from "next/server";
import { listBookmarks } from "@/lib/services/bookmarks.service";

export async function GET() {
  return NextResponse.json({ bookmarks: await listBookmarks("demo-user") });
}
