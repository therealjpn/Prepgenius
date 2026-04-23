import { subscriptionPlans } from "@/lib/data/mock";
import type { SubscriptionTier } from "@/lib/types";

export function getSubscriptionEntitlements(tier: SubscriptionTier) {
  return subscriptionPlans[tier];
}

export function canAskTutor(tier: SubscriptionTier, usedToday: number) {
  const limit = subscriptionPlans[tier].tutorMessagesPerDay;
  return !Number.isFinite(limit) || usedToday < limit;
}

export function canPracticeQuestions(tier: SubscriptionTier, usedToday: number) {
  const limit = subscriptionPlans[tier].questionsPerDay;
  return !Number.isFinite(limit) || usedToday < limit;
}

export function getUpgradePrompt() {
  return {
    title: "Upgrade to keep learning",
    body: "Unlimited practice, AI tutor access, study plans, and premium insights unlock on paid tiers."
  };
}

