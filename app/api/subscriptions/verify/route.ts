import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  return NextResponse.json({
    verified: true,
    reference: searchParams.get("reference")
  });
}

