import { AppShell } from "@/components/layout/app-shell";

export default function WhatsAppPage() {
  return (
    <AppShell
      title="WhatsApp Connect"
      subtitle="The bot is part of the same product, not a sidecar. Account linking, reminders, tutoring, and payment confirmation all plug into the shared service layer."
    >
      <article className="rounded-[28px] bg-white p-6 shadow-soft">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-700">Start on WhatsApp</p>
        <h2 className="mt-2 text-2xl font-bold">Save the bot number and send “Hi”.</h2>
        <p className="mt-3 text-sm leading-7 text-ink-500">
          +234 XXX XXXX XXX
          <br />
          Your practice sessions, AI tutor chats, and subscription status sync back to your web dashboard automatically.
        </p>

        <div className="mt-5 rounded-[24px] bg-brand-50 p-4 text-sm leading-7 text-ink-900">
          <p>*PrepGenius Menu*</p>
          <p>📝 Practice Questions</p>
          <p>⏱️ Mock Exam</p>
          <p>🧠 AI Tutor</p>
          <p>💳 Subscribe / Manage Plan</p>
        </div>
      </article>
    </AppShell>
  );
}

