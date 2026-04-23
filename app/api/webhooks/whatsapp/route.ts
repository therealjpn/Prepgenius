import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { env } from "@/lib/config/env";
import { routeWhatsAppMessage } from "@/lib/whatsapp/router";

function safeCompare(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }
  return timingSafeEqual(leftBuffer, rightBuffer);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === env.WHATSAPP_VERIFY_TOKEN && challenge) {
    return new Response(challenge, { status: 200 });
  }

  return NextResponse.json({ error: "Verification failed" }, { status: 403 });
}

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-hub-signature-256");

  if (env.WHATSAPP_APP_SECRET && signature) {
    const expected = `sha256=${createHmac("sha256", env.WHATSAPP_APP_SECRET).update(rawBody).digest("hex")}`;
    const valid = safeCompare(expected, signature);
    if (!valid) {
      return NextResponse.json({ error: "Invalid webhook signature" }, { status: 401 });
    }
  }

  const body = JSON.parse(rawBody) as {
    entry?: Array<{
      changes?: Array<{
        value?: {
          messages?: Array<any>;
        };
      }>;
    }>;
  };

  const message = body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
  const phone = message?.from;

  if (phone && message) {
    await routeWhatsAppMessage(phone, message);
  }

  return NextResponse.json({ received: true });
}
