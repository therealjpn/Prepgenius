import { mockPracticeSession, mockStudyPlan, mockUser } from "@/lib/data/mock";
import type { PracticeSession, StudyPlan, TutorMessage, UserProfile } from "@/lib/types";

const practiceSessions = new Map<string, PracticeSession>([[mockPracticeSession.sessionId, mockPracticeSession]]);
const tutorThreads = new Map<string, TutorMessage[]>();
const profiles = new Map<string, UserProfile>([[mockUser.id, mockUser]]);
const studyPlans = new Map<string, StudyPlan>([[mockUser.id, mockStudyPlan]]);
const phoneToUserId = new Map<string, string>([[mockUser.whatsappPhone ?? "", mockUser.id]]);

export const memoryStore = {
  practiceSessions,
  tutorThreads,
  profiles,
  studyPlans,
  phoneToUserId
};

