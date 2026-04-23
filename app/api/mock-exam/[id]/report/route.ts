import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  return NextResponse.json({
    id,
    aiReport:
      "Great improvement from last week. Focus on Physics, especially Electricity and Magnetism, before your next full mock."
  });
}

