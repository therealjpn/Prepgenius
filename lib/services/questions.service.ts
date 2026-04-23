import { mockQuestions } from "@/lib/data/mock";
import { subjectCatalog } from "@/lib/data/subjects";
import type { ExamType, Question } from "@/lib/types";

export async function listSubjects(examType: ExamType) {
  return subjectCatalog.filter((subject) => subject.examType === examType);
}

export async function getQuestions(params: {
  examType: ExamType;
  subject?: string;
  topic?: string;
  count?: number;
}) {
  const filtered = mockQuestions.filter((question) => {
    return (
      question.examType === params.examType &&
      (!params.subject || question.subject.toLowerCase() === params.subject.toLowerCase()) &&
      (!params.topic || question.topic.toLowerCase() === params.topic.toLowerCase())
    );
  });

  const pool = filtered.length ? filtered : mockQuestions.filter((question) => question.examType === params.examType);
  return pool.slice(0, params.count ?? 10);
}

export function buildQuestionPrompt(params: {
  examType: string;
  examName: string;
  subject: string;
  topicList: string[];
  count: number;
}) {
  return `You are an expert Nigerian exam question setter. Generate ${params.count} ${params.examType} questions for '${params.subject}' at the ${params.examName} level.\n\nRequirements:\n- Match the exact format, difficulty, and style of real ${params.examName} past questions\n- For MCQ: 4 options (A-D) with exactly one correct answer and plausible distractors\n- Cover these topics: ${params.topicList.join(", ")}\n- Difficulty: 30% Easy, 50% Medium, 20% Hard\n- Include correct answer and detailed explanation\n- Return ONLY valid JSON array.`;
}

export function getQuestionById(questionId: string): Question | null {
  return mockQuestions.find((question) => question.id === questionId) ?? null;
}

