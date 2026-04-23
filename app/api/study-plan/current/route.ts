import { NextResponse } from "next/server";
import { getCurrentStudyPlan } from "@/lib/services/studyPlan.service";

export async function GET() {
  const studyPlan = await getCurrentStudyPlan("demo-user");
  return NextResponse.json(studyPlan);
}

