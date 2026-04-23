import { mockAnalytics } from "@/lib/data/mock";

export async function getAnalyticsOverview(_userId: string) {
  return mockAnalytics;
}

