import { NextResponse } from "next/server";
import { getPlanAmount, initializePaystackPayment } from "@/lib/paystack";
import type { SubscriptionTier } from "@/lib/types";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    tier: SubscriptionTier;
    email?: string;
    userId?: string;
    phone?: string;
    source?: string;
  };

  const tier = body.tier ?? "premium";
  const payment = await initializePaystackPayment({
    email: body.email ?? "demo@prepgenius.com.ng",
    amount: getPlanAmount(tier),
    metadata: {
      userId: body.userId ?? "demo-user",
      phone: body.phone ?? "+2348012345678",
      source: body.source ?? "web",
      tier
    }
  });

  return NextResponse.json(payment);
}

