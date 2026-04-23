import { AppShell } from "@/components/layout/app-shell";
import { mockQuestions } from "@/lib/data/mock";

export default function BookmarksPage() {
  return (
    <AppShell
      title="Bookmarks"
      subtitle="Saved questions live centrally so a student can bookmark on WhatsApp and review later on the richer web interface."
    >
      <section className="grid gap-4">
        {mockQuestions.map((question) => (
          <article key={question.id} className="rounded-[28px] bg-white p-6 shadow-soft">
            <p className="text-sm font-medium text-ink-500">
              {question.subject} • {question.topic}
            </p>
            <h2 className="mt-3 text-lg font-bold">{question.questionText}</h2>
            <p className="mt-3 text-sm leading-7 text-ink-500">{question.explanation}</p>
          </article>
        ))}
      </section>
    </AppShell>
  );
}

