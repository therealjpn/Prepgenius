import { NextResponse } from "next/server";
import { getOrCreateUserByPhone } from "@/lib/services/user.service";

export async function POST(request: Request) {
  const body = await request.json();
  const userId = await getOrCreateUserByPhone(body.phone ?? "+2348012345678", body.fullName);
  return NextResponse.json({ linked: true, userId });
}

