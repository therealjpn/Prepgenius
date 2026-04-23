import { sendAnthropicMessage } from "@/lib/anthropic";
import { memoryStore } from "@/lib/server/memory-store";
import type { TutorMessage } from "@/lib/types";

const basePrompt = `You are PrepGenius AI Tutor, a patient and encouraging Nigerian exam prep tutor.
Explain simply, use relatable examples, and keep responses concise for students on mobile.`;

export async function chatWithTutor(params: {
  userId: string;
  subject: string;
  prompt: string;
}) {
  const history = memoryStore.tutorThreads.get(params.userId) ?? [];
  const messages: TutorMessage[] = [
    ...history,
    {
      role: "user",
      content: params.prompt,
      createdAt: new Date().toISOString()
    }
  ];

  const response =
    (await sendAnthropicMessage(
      `${basePrompt}\nThe current subject is ${params.subject}.`,
      messages.map((message) => ({
        role: message.role === "assistant" ? "assistant" : "user",
        content: message.content
      }))
    )) ??
    `Let's break ${params.subject} down step by step.\n\n${params.prompt}\n\nStart with the core idea, then try one small example, and I can give you a faster shortcut after that.`;

  const updatedHistory: TutorMessage[] = [
    ...messages,
    {
      role: "assistant",
      content: response,
      createdAt: new Date().toISOString()
    }
  ];

  memoryStore.tutorThreads.set(params.userId, updatedHistory);

  return {
    reply: response,
    history: updatedHistory
  };
}

