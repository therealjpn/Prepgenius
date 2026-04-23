import { env } from "@/lib/config/env";
import { subscriptionPlans } from "@/lib/data/mock";
import type { SubscriptionTier } from "@/lib/types";

export async function initializePaystackPayment(params: {
  email: string;
  amount: number;
  metadata: Record<string, string>;
}) {
  if (!env.PAYSTACK_SECRET_KEY) {
    return {
      authorization_url: `${env.NEXT_PUBLIC_APP_URL}/subscribe?demo=1`,
      reference: `demo_${Date.now()}`
    };
  }

  const response = await fetch("https://api.paystack.co/transaction/initialize", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.PAYSTACK_SECRET_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      email: params.email,
      amount: params.amount,
      callback_url: `${env.NEXT_PUBLIC_APP_URL}/subscribe`,
      metadata: params.metadata
    })
  });

  if (!response.ok) {
    throw new Error("Unable to initialize Paystack transaction");
  }

  const payload = (await response.json()) as {
    data: { authorization_url: string; reference: string };
  };

  return payload.data;
}

export function getPlanAmount(plan: SubscriptionTier) {
  return subscriptionPlans[plan].amount * 100;
}

