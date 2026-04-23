import { mockQuestions } from "@/lib/data/mock";
import { generateId, percent } from "@/lib/utils";

export async function startMockExam(userId: string, subjects: string[]) {
  return {
    id: generateId("mock"),
    userId,
    examType: "jamb",
    subjects,
    totalQuestions: subjects.length * 10,
    questionIds: mockQuestions.map((question) => question.id),
    startedAt: new Date().toISOString()
  };
}

export async function submitMockExam(totalQuestions: number, correctAnswers: number) {
  return {
    scorePercentage: percent(correctAnswers, totalQuestions),
    aiReport:
      "Your strongest subject is Mathematics. Physics needs more revision on Electricity and Waves before your next mock."
  };
}

