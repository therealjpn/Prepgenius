import { NextResponse } from "next/server";
import { env } from "@/lib/config/env";
import { sendDailyReminder } from "@/lib/services/notification.service";

export async function POST(request: Request) {
  const secret = request.headers.get("x-cron-secret");
  if (env.CRON_SECRET && secret !== env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await sendDailyReminder("+2348012345678", "Adaeze", "Mathematics — Quadratic Equations", 12);
  return NextResponse.json({ queued: true, result });
}

