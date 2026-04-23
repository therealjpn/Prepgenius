"use client";

import { useState } from "react";

export function TutorChat({ subject }: { subject: string }) {
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState<Array<{ role: "user" | "assistant"; content: string }>>([
    {
      role: "assistant",
      content: `Ask me anything about ${subject}. I’ll keep it simple, step-by-step, and exam-focused.`
    }
  ]);
  const [loading, setLoading] = useState(false);

  async function sendMessage() {
    if (!prompt.trim()) {
      return;
    }

    const nextMessages = [...messages, { role: "user" as const, content: prompt }];
    setMessages(nextMessages);
    setLoading(true);

    const response = await fetch("/api/tutor/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        userId: "demo-user",
        subject,
        prompt
      })
    });
    const data = await response.json();
    setMessages([...nextMessages, { role: "assistant", content: data.reply }]);
    setPrompt("");
    setLoading(false);
  }

  return (
    <section className="rounded-[28px] bg-white p-5 shadow-soft">
      <div className="space-y-4">
        {messages.map((message, index) => (
          <div
            key={`${message.role}-${index}`}
            className={
              message.role === "assistant"
                ? "max-w-[90%] rounded-[24px] rounded-tl-md bg-brand-50 px-4 py-3 text-sm leading-7 text-ink-900"
                : "ml-auto max-w-[90%] rounded-[24px] rounded-tr-md bg-brand-700 px-4 py-3 text-sm leading-7 text-white"
            }
          >
            {message.content}
          </div>
        ))}
      </div>

      <div className="mt-5 flex gap-3">
        <textarea
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          placeholder="Explain simultaneous equations..."
          className="min-h-24 flex-1 rounded-[24px] border border-brand-100 px-4 py-3 outline-none transition focus:border-brand-500"
        />
        <button
          type="button"
          onClick={sendMessage}
          disabled={loading}
          className="self-end rounded-[24px] bg-amber-500 px-5 py-3 font-semibold text-white disabled:opacity-70"
        >
          {loading ? "Thinking..." : "Send"}
        </button>
      </div>
    </section>
  );
}

