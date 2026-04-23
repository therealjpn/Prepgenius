import { AppShell } from "@/components/layout/app-shell";
import { ActivityChart } from "@/components/charts/activity-chart";
import { getAnalyticsOverview } from "@/lib/services/analytics.service";

export default async function AnalyticsPage() {
  const analytics = await getAnalyticsOverview("demo-user");

  return (
    <AppShell
      title="Performance Analytics"
      subtitle="Track readiness, weak topics, and the split between web usage and WhatsApp engagement from one dashboard."
    >
      <article className="rounded-[28px] bg-white p-6 shadow-soft">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-700">Weekly Activity</p>
        <h2 className="mt-2 text-2xl font-bold">How this week’s practice is distributed</h2>
        <p className="mt-2 text-sm text-ink-500">You answered 45 questions on WhatsApp and 23 on web this week.</p>
        <div className="mt-5">
          <ActivityChart data={analytics.weeklyActivity} />
        </div>
      </article>

      <section className="grid gap-4">
        {analytics.subjectPerformance.map((item) => (
          <article key={item.subject} className="rounded-[28px] bg-white p-6 shadow-soft">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold">{item.subject}</h3>
              <span className="rounded-full bg-brand-50 px-4 py-2 text-sm font-semibold text-brand-700">
                {item.accuracy}% accuracy
              </span>
            </div>
            <p className="mt-3 text-sm text-ink-500">
              Practiced {item.total} questions. Weak topics: {item.weakTopics.join(", ")}.
            </p>
          </article>
        ))}
      </section>
    </AppShell>
  );
}

