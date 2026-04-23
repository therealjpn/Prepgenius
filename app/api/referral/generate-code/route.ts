import { NextResponse } from "next/server";
import { generateReferralCode } from "@/lib/services/referral.service";

export async function POST() {
  const code = await generateReferralCode("demo-user");
  return NextResponse.json({ code });
}
