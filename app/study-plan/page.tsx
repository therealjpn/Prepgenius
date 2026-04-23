import { AppShell } from "@/components/layout/app-shell";
import { getCurrentStudyPlan } from "@/lib/services/studyPlan.service";

export default async function StudyPlanPage() {
  const plan = await getCurrentStudyPlan("demo-user");

  return (
    <AppShell
      title="Study Plan"
      subtitle="AI-generated weekly planning keeps mobile sessions short, realistic, and aligned to the exam date and weak topics."
    >
      <section className="grid gap-4">
        {plan.days.map((day) => (
          <article key={day.day} className="rounded-[28px] bg-white p-6 shadow-soft">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-700">{day.day}</p>
                <h2 className="mt-2 text-2xl font-bold">{day.focus}</h2>
              </div>
              <span className="rounded-full bg-gold-500/15 px-4 py-2 text-sm font-semibold text-amber-500">
                {day.durationMinutes} min
              </span>
            </div>
            <div className="mt-4 grid gap-3">
              {day.tasks.map((task) => (
                <div key={task} className="rounded-[22px] bg-background px-4 py-3 text-sm text-ink-500">
                  {task}
                </div>
              ))}
            </div>
          </article>
        ))}
      </section>
    </AppShell>
  );
}

