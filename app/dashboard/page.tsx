import Link from "next/link";
import { BookOpen, Flame, MessageCircle, Trophy } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { StatCard } from "@/components/dashboard/stat-card";
import { getAnalyticsOverview } from "@/lib/services/analytics.service";
import { getUserProfile } from "@/lib/services/user.service";
import { formatCountdown } from "@/lib/utils";

export default async function DashboardPage() {
  const [profile, analytics] = await Promise.all([getUserProfile("demo-user"), getAnalyticsOverview("demo-user")]);

  return (
    <AppShell
      title={`Welcome back, ${profile.fullName.split(" ")[0]}`}
      subtitle="Your progress from web and WhatsApp is synced here, so you can keep moving whether you're on data saver mode or at your desk."
    >
      <section className="card-grid">
        <StatCard label="Study Streak" value={`${analytics.streakCount} days`} hint="Consistency is compounding." icon={<Flame className="h-5 w-5" />} />
        <StatCard label="Readiness Score" value={`${analytics.readinessScore}%`} hint="Based on recent practice and weak-topic coverage." icon={<Trophy className="h-5 w-5" />} />
        <StatCard label="Questions Practiced" value={analytics.questionsPracticed.toString()} hint="Includes 45 answered on WhatsApp this week." icon={<BookOpen className="h-5 w-5" />} />
        <StatCard label="Exam Countdown" value={formatCountdown(profile.examDate)} hint="Lock in the next revision sprint early." icon={<MessageCircle className="h-5 w-5" />} />
      </section>

      <section className="grid gap-4">
        <article className="rounded-[28px] bg-white p-6 shadow-soft">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-700">Quick Start</p>
              <h2 className="mt-2 text-2xl font-bold">Jump back into what matters most.</h2>
            </div>
            <Link href="/practice" className="rounded-full bg-amber-500 px-5 py-3 font-semibold text-white">
              Practice Now
            </Link>
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <Link href="/practice" className="rounded-[24px] border border-brand-100 p-4 hover:bg-brand-50">
              <p className="font-semibold">Mathematics drill</p>
              <p className="mt-1 text-sm text-ink-500">Resume Quadratic Equations</p>
            </Link>
            <Link href="/tutor" className="rounded-[24px] border border-brand-100 p-4 hover:bg-brand-50">
              <p className="font-semibold">Ask the AI Tutor</p>
              <p className="mt-1 text-sm text-ink-500">Clear up Electricity before your next quiz</p>
            </Link>
            <Link href="/whatsapp" className="rounded-[24px] border border-brand-100 p-4 hover:bg-brand-50">
              <p className="font-semibold">Practice on WhatsApp</p>
              <p className="mt-1 text-sm text-ink-500">Save the bot number and sync on the move</p>
            </Link>
          </div>
        </article>

        <article className="rounded-[28px] bg-white p-6 shadow-soft">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-700">Weak Areas</p>
          <div className="mt-4 grid gap-3">
            {analytics.subjectPerformance
              .filter((item) => item.weakTopics.length)
              .slice(0, 3)
              .map((item) => (
                <div key={item.subject} className="rounded-[22px] bg-background p-4">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold">{item.subject}</p>
                    <span className="text-sm font-semibold text-danger">{item.accuracy}%</span>
                  </div>
                  <p className="mt-2 text-sm text-ink-500">Focus on {item.weakTopics.join(", ")} this week.</p>
                </div>
              ))}
          </div>
        </article>
      </section>
    </AppShell>
  );
}

