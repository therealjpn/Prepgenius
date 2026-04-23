import { Redis } from "@upstash/redis";
import { env } from "@/lib/config/env";
import type { ConversationState } from "@/lib/types";

const redis =
  env.UPSTASH_REDIS_URL && env.UPSTASH_REDIS_TOKEN
    ? new Redis({
        url: env.UPSTASH_REDIS_URL,
        token: env.UPSTASH_REDIS_TOKEN
      })
    : null;

const inMemorySessions = new Map<string, ConversationState>();

export async function getSession(phone: string): Promise<ConversationState> {
  if (redis) {
    const session = await redis.get<ConversationState>(`wa:session:${phone}`);
    if (session) {
      return session;
    }
  }

  return inMemorySessions.get(phone) ?? { state: "MAIN_MENU", context: {} };
}

export async function setSession(phone: string, session: ConversationState) {
  if (redis) {
    await redis.set(`wa:session:${phone}`, session, { ex: 86400 });
  }

  inMemorySessions.set(phone, session);
}

