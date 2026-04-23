import { Clock3, MonitorPlay, ShieldCheck } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";

export default function MockExamsPage() {
  return (
    <AppShell
      title="Mock Exams"
      subtitle="Timed full-length simulations stay on the web app where students get a focused CBT-style experience and deeper analytics."
    >
      <section className="card-grid">
        {[
          {
            title: "JAMB CBT Mode",
            body: "No-going-back toggle, real timing pressure, and subject split similar to the actual exam.",
            icon: MonitorPlay
          },
          {
            title: "Auto-Submit Timing",
            body: "Server-side timing keeps the countdown honest even if the page is refreshed or the connection drops.",
            icon: Clock3
          },
          {
            title: "AI Coach Report",
            body: "Every completed mock returns actionable topic-level feedback and confidence guidance.",
            icon: ShieldCheck
          }
        ].map(({ title, body, icon: Icon }) => (
          <article key={title} className="rounded-[28px] bg-white p-6 shadow-soft">
            <div className="inline-flex rounded-2xl bg-brand-50 p-3 text-brand-700">
              <Icon className="h-5 w-5" />
            </div>
            <h2 className="mt-4 text-2xl font-bold">{title}</h2>
            <p className="mt-3 text-sm leading-7 text-ink-500">{body}</p>
          </article>
        ))}
      </section>
    </AppShell>
  );
}

