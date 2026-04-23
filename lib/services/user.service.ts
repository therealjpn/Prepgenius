import { mockUser } from "@/lib/data/mock";
import { memoryStore } from "@/lib/server/memory-store";
import type { Platform, UserProfile } from "@/lib/types";

export async function getUserProfile(userId: string) {
  return memoryStore.profiles.get(userId) ?? mockUser;
}

export async function getUserIdByPhone(phone: string) {
  return memoryStore.phoneToUserId.get(phone) ?? null;
}

export async function getOrCreateUserByPhone(phone: string, displayName = "PrepGenius Student") {
  const existing = memoryStore.phoneToUserId.get(phone);
  if (existing) {
    return existing;
  }

  const profileId = `wa_${phone.replace(/\D/g, "")}`;
  const profile: UserProfile = {
    ...mockUser,
    id: profileId,
    fullName: displayName,
    phone,
    whatsappPhone: phone,
    onboardingCompleted: false,
    onboardingSource: "whatsapp"
  };

  memoryStore.profiles.set(profileId, profile);
  memoryStore.phoneToUserId.set(phone, profileId);
  return profileId;
}

export async function resetDailyLimitsIfNeeded(userId: string) {
  const profile = await getUserProfile(userId);
  const today = new Date().toISOString().slice(0, 10);
  if (profile.dailyResetDate === today) {
    return profile;
  }

  const updated: UserProfile = {
    ...profile,
    dailyQuestionsUsed: 0,
    dailyTutorMessagesUsed: 0,
    dailyResetDate: today
  };
  memoryStore.profiles.set(userId, updated);
  return updated;
}

export async function completeOnboarding(userId: string, payload: Partial<UserProfile>, source: Platform) {
  const profile = await getUserProfile(userId);
  const updated: UserProfile = {
    ...profile,
    ...payload,
    onboardingCompleted: true,
    onboardingSource: source
  };
  memoryStore.profiles.set(userId, updated);
  if (updated.whatsappPhone) {
    memoryStore.phoneToUserId.set(updated.whatsappPhone, userId);
  }
  return updated;
}
