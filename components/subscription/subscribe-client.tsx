"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Check, LoaderCircle } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { subscriptionPlans } from "@/lib/data/mock";
import type { SubscriptionTier } from "@/lib/types";
import { cn } from "@/lib/utils";

type CheckoutState = "idle" | "loading" | "verifying" | "success" | "error";

export function SubscribeClient({
  currentTier,
  defaultEmail,
  defaultPhone,
  userId
}: {
  currentTier: SubscriptionTier;
  defaultEmail: string;
  defaultPhone: string;
  userId: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reference = searchParams.get("reference");
  const demo = searchParams.get("demo");
  const [email, setEmail] = useState(defaultEmail);
  const [activeTier, setActiveTier] = useState<SubscriptionTier | null>(null);
  const [checkoutState, setCheckoutState] = useState<CheckoutState>("idle");
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (demo === "1") {
      setCheckoutState("success");
      setFeedback("Demo checkout completed. In live mode, this is where Paystack redirects back after payment.");
      return;
    }

    if (!reference) {
      return;
    }

    let cancelled = false;

    async function verifyPayment() {
      setCheckoutState("verifying");
      setFeedback("Confirming your payment reference...");

      try {
        const response = await fetch(`/api/subscriptions/verify?reference=${encodeURIComponent(reference)}`);

        if (!response.ok) {
          throw new Error("Unable to verify your payment right now.");
        }

        const payload = (await response.json()) as { verified: boolean; reference: string | null };

        if (cancelled) {
          return;
        }

        if (!payload.verified) {
          throw new Error("Payment verification is still pending.");
        }

        setCheckoutState("success");
        setFeedback(`Payment confirmed for reference ${payload.reference}. Your web and WhatsApp access can now be upgraded from the same account.`);
      } catch (error) {
        if (cancelled) {
          return;
        }

        setCheckoutState("error");
        setFeedback(error instanceof Error ? error.message : "Something went wrong while verifying payment.");
      }
    }

    void verifyPayment();

    return () => {
      cancelled = true;
    };
  }, [demo, reference]);

  async function handleCheckout(tier: SubscriptionTier) {
    if (!email.trim()) {
      setCheckoutState("error");
      setFeedback("Add a receipt email before starting checkout.");
      return;
    }

    if (tier === "free") {
      setCheckoutState("idle");
      setFeedback("The free tier does not need checkout. Choose a paid plan when you want more daily questions, tutor usage, and mock access.");
      return;
    }

    setActiveTier(tier);
    setCheckoutState("loading");
    setFeedback(null);

    try {
      const response = await fetch("/api/subscriptions/initialize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          tier,
          email,
          userId,
          phone: defaultPhone,
          source: "web"
        })
      });

      if (!response.ok) {
        throw new Error("Unable to start checkout right now.");
      }

      const payload = (await response.json()) as {
        authorization_url?: string;
        reference?: string;
      };

      if (payload.authorization_url) {
        window.location.href = payload.authorization_url;
        return;
      }

      if (payload.reference) {
        router.replace(`/subscribe?reference=${encodeURIComponent(payload.reference)}`);
        return;
      }

      throw new Error("Checkout started, but no payment URL was returned.");
    } catch (error) {
      setCheckoutState("error");
      setFeedback(error instanceof Error ? error.message : "Something went wrong while starting checkout.");
      setActiveTier(null);
    }
  }

  return (
    <AppShell
      title="Choose a Plan"
      subtitle="Every paid plan unlocks the same PrepGenius account across web and WhatsApp, so one payment keeps both study surfaces in sync."
    >
      <section className="rounded-[28px] bg-white p-6 shadow-soft">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="max-w-xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-700">Checkout Email</p>
            <h2 className="mt-2 text-2xl font-bold text-ink-900">Send payment receipts to the learner account.</h2>
            <p className="mt-2 text-sm leading-7 text-ink-500">
              This email is passed to Paystack and used to tie the payment reference back to the same PrepGenius profile.
            </p>
          </div>
          <div className="rounded-[22px] bg-brand-50 px-4 py-3 text-sm font-medium text-brand-800">
            Current tier: {subscriptionPlans[currentTier].label}
          </div>
        </div>

        <label className="mt-5 block">
          <span className="text-sm font-medium text-ink-700">Email address</span>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="mt-2 w-full rounded-2xl border border-brand-100 bg-background px-4 py-3 text-base text-ink-900 outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
            placeholder="student@example.com"
          />
        </label>

        {feedback ? (
          <div
            className={cn(
              "mt-4 rounded-[22px] px-4 py-3 text-sm",
              checkoutState === "error" ? "bg-rose-50 text-rose-700" : "bg-emerald-50 text-emerald-700"
            )}
          >
            {feedback}
          </div>
        ) : null}
      </section>

      <section className="grid gap-4">
        {Object.entries(subscriptionPlans).map(([tierKey, plan]) => {
          const tier = tierKey as SubscriptionTier;
          const isCurrentPlan = tier === currentTier;
          const isLoadingThisPlan = checkoutState === "loading" && activeTier === tier;

          return (
            <article key={tier} className="rounded-[28px] bg-white p-6 shadow-soft">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-700">{plan.label}</p>
                    {isCurrentPlan ? (
                      <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-800">
                        Active now
                      </span>
                    ) : null}
                  </div>
                  <h2 className="mt-2 text-3xl font-bold text-ink-900">
                    {plan.amount === 0 ? "Free" : `₦${plan.amount.toLocaleString()}/mo`}
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={() => void handleCheckout(tier)}
                  disabled={isCurrentPlan || isLoadingThisPlan}
                  className={cn(
                    "inline-flex min-w-32 items-center justify-center gap-2 rounded-full px-5 py-3 font-semibold text-white transition",
                    isCurrentPlan ? "bg-brand-300" : "bg-amber-500 hover:bg-amber-600",
                    isLoadingThisPlan ? "cursor-wait" : "",
                    (isCurrentPlan || isLoadingThisPlan) && "opacity-90"
                  )}
                >
                  {isLoadingThisPlan ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
                  {isCurrentPlan ? "Current Plan" : plan.amount === 0 ? "Stay Free" : "Select Plan"}
                </button>
              </div>

              <div className="mt-5 grid gap-3 text-sm text-ink-500">
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-brand-700" />
                  {Number.isFinite(plan.questionsPerDay) ? `${plan.questionsPerDay} questions/day` : "Unlimited questions"}
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-brand-700" />
                  {Number.isFinite(plan.tutorMessagesPerDay)
                    ? `${plan.tutorMessagesPerDay} tutor messages/day`
                    : "Unlimited tutor messages"}
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-brand-700" />
                  {Number.isFinite(plan.mockExamsPerMonth) ? `${plan.mockExamsPerMonth} mock exams/month` : "Unlimited mocks"}
                </div>
              </div>
            </article>
          );
        })}
      </section>
    </AppShell>
  );
}
