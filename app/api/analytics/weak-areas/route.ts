import { NextResponse } from "next/server";
import { getAnalyticsOverview } from "@/lib/services/analytics.service";

export async function GET() {
  const analytics = await getAnalyticsOverview("demo-user");
  const weakAreas = analytics.subjectPerformance.filter((item) => item.weakTopics.length > 0);
  return NextResponse.json({ weakAreas });
}

