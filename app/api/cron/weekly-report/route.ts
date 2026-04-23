import { NextResponse } from "next/server";
import { env } from "@/lib/config/env";
import { sendPlainNotification } from "@/lib/services/notification.service";

export async function POST(request: Request) {
  const secret = request.headers.get("x-cron-secret");
  if (env.CRON_SECRET && secret !== env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await sendPlainNotification(
    "+2348012345678",
    "📊 Weekly report: 68 questions practiced, 71% accuracy. Keep pushing."
  );
  return NextResponse.json({ queued: true, result });
}

