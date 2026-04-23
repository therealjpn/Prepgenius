import { NextResponse } from "next/server";
import { env } from "@/lib/config/env";
import { resetDailyLimitsIfNeeded } from "@/lib/services/user.service";

export async function POST(request: Request) {
  const secret = request.headers.get("x-cron-secret");
  if (env.CRON_SECRET && secret !== env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const profile = await resetDailyLimitsIfNeeded("demo-user");
  return NextResponse.json({ reset: true, profile });
}

