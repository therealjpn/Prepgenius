import { generateId } from "@/lib/utils";

export async function generateReferralCode(userId: string) {
  return `PG-${userId.slice(0, 4).toUpperCase()}-${generateId("ref").slice(-4).toUpperCase()}`;
}

