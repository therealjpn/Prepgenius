import { NextResponse } from "next/server";
import { getAnalyticsOverview } from "@/lib/services/analytics.service";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const analytics = await getAnalyticsOverview("demo-user");
  const subject = analytics.subjectPerformance.find((item) => item.subject.toLowerCase() === slug.replace(/-/g, " "));
  return NextResponse.json({ subject });
}

