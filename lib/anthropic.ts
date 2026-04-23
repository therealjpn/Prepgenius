import { env } from "@/lib/config/env";

interface AnthropicMessage {
  role: "user" | "assistant";
  content: string;
}

export async function sendAnthropicMessage(system: string, messages: AnthropicMessage[]) {
  if (!env.ANTHROPIC_API_KEY) {
    return null;
  }

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01"
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 900,
      system,
      messages
    })
  });

  if (!response.ok) {
    throw new Error("Anthropic request failed");
  }

  const data = (await response.json()) as { content?: Array<{ text?: string }> };
  return data.content?.[0]?.text ?? null;
}

