import { mockStudyPlan } from "@/lib/data/mock";
import { memoryStore } from "@/lib/server/memory-store";
import type { StudyPlan } from "@/lib/types";

export async function getCurrentStudyPlan(userId: string) {
  return memoryStore.studyPlans.get(userId) ?? mockStudyPlan;
}

export async function generateStudyPlan(userId: string): Promise<StudyPlan> {
  const plan = { ...mockStudyPlan, weekOf: new Date().toISOString().slice(0, 10) };
  memoryStore.studyPlans.set(userId, plan);
  return plan;
}

