import { NextResponse } from "next/server";
import { getAnalyticsOverview } from "@/lib/services/analytics.service";

export async function GET() {
  const analytics = await getAnalyticsOverview("demo-user");
  return NextResponse.json(analytics);
}

