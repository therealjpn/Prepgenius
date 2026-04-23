import { mockPracticeSession } from "@/lib/data/mock";
import { memoryStore } from "@/lib/server/memory-store";
import type { AnswerResult, Platform, PracticeSession } from "@/lib/types";
import { generateId } from "@/lib/utils";
import { getQuestions, getQuestionById } from "@/lib/services/questions.service";
import { getUserProfile } from "@/lib/services/user.service";

export async function startPracticeSession(params: {
  userId: string;
  platform: Platform;
  examType: PracticeSession["examType"];
  subject: string;
  topic: string;
}) {
  const questions = await getQuestions({
    examType: params.examType,
    subject: params.subject,
    topic: params.topic,
    count: 10
  });

  const session: PracticeSession = {
    ...mockPracticeSession,
    sessionId: generateId("session"),
    userId: params.userId,
    platform: params.platform,
    examType: params.examType,
    subject: params.subject,
    topic: params.topic,
    questions,
    currentQuestionIndex: 0,
    score: 0,
    startedAt: new Date().toISOString()
  };

  memoryStore.practiceSessions.set(session.sessionId, session);
  return session;
}

export async function getPracticeSession(sessionId: string) {
  return memoryStore.practiceSessions.get(sessionId) ?? null;
}

export async function submitPracticeAnswer(params: {
  sessionId: string;
  questionId: string;
  selectedAnswer: string;
}) {
  const session = await getPracticeSession(params.sessionId);
  if (!session) {
    throw new Error("Practice session not found");
  }

  const question = getQuestionById(params.questionId);
  if (!question) {
    throw new Error("Question not found");
  }

  const correct = question.correctAnswer.toLowerCase() === params.selectedAnswer.toLowerCase();
  const nextIndex = session.currentQuestionIndex + 1;
  const score = correct ? session.score + 1 : session.score;
  const updatedSession: PracticeSession = {
    ...session,
    score,
    currentQuestionIndex: nextIndex
  };
  memoryStore.practiceSessions.set(session.sessionId, updatedSession);

  const profile = await getUserProfile(session.userId);
  const streakCount = correct ? profile.streakCount + 1 : Math.max(profile.streakCount - 1, 0);

  const result: AnswerResult = {
    correct,
    correctAnswer: question.correctAnswer,
    explanation: question.explanation,
    streakCount,
    nextQuestion: updatedSession.questions[nextIndex] ?? null
  };

  return result;
}

