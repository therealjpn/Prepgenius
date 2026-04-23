import { mockQuestions } from "@/lib/data/mock";

export async function listBookmarks(_userId: string) {
  return mockQuestions;
}

export async function addBookmark(questionId: string) {
  return { questionId, saved: true };
}

export async function removeBookmark(questionId: string) {
  return { questionId, removed: true };
}

