import { NextResponse } from "next/server";
import { generateStudyPlan } from "@/lib/services/studyPlan.service";

export async function POST() {
  const plan = await generateStudyPlan("demo-user");
  return NextResponse.json(plan);
}

