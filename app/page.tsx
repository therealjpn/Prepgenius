import Link from "next/link";
import { ArrowRight, Brain, ChartNoAxesCombined, MessageCircleMore, Smartphone } from "lucide-react";
import { BrandLockup } from "@/components/layout/brand-lockup";

const featureCards = [
  {
    title: "Practice Anywhere",
    body: "Switch between a fast mobile-first PWA and a WhatsApp bot that keeps your streak alive on the go.",
    icon: Smartphone
  },
  {
    title: "Tutor That Explains",
    body: "Ask follow-up questions until a concept clicks, with step-by-step Nigerian exam style explanations.",
    icon: Brain
  },
  {
    title: "Track Real Progress",
    body: "See weak topics, readiness score, streaks, and how your web + WhatsApp practice combines.",
    icon: ChartNoAxesCombined
  },
  {
    title: "WhatsApp-Native Retention",
    body: "Daily challenges, reminders, subscription links, and low-friction practice sessions right inside chat.",
    icon: MessageCircleMore
  }
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-hero-glow">
      <section className="mx-auto flex max-w-6xl flex-col gap-8 px-4 pb-20 pt-6 md:px-6 lg:pb-24 lg:pt-10">
        <header className="rounded-[36px] bg-brand-900 px-6 py-10 text-white shadow-soft md:px-10">
          <BrandLockup />

          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="mt-8 text-sm font-semibold uppercase tracking-[0.24em] text-brand-100">Dual Platform Exam Prep</p>
              <h1 className="mt-4 text-4xl font-bold leading-tight md:text-6xl">
                Prep smarter for WAEC, JAMB, NECO, and ICAN on web and WhatsApp.
              </h1>
              <p className="mt-4 max-w-xl text-base leading-8 text-brand-100 md:text-lg">
                PrepGenius is designed for Nigerian learners who need fast practice, encouraging AI tutoring, and synced
                progress across the devices and chat apps they already use every day.
              </p>
            </div>
            <div className="rounded-[32px] bg-white/10 p-6 backdrop-blur">
              <p className="text-sm text-brand-100">Launch-ready MVP scope</p>
              <ul className="mt-4 space-y-3 text-sm text-white">
                <li>Web PWA with dashboard, practice, tutor, analytics, study plan</li>
                <li>WhatsApp webhook, state machine, subscription payment links</li>
                <li>Shared service layer for business logic and synced progress</li>
              </ul>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-full bg-amber-500 px-5 py-3 font-semibold text-white"
            >
              Open Demo Dashboard
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/whatsapp"
              className="inline-flex items-center gap-2 rounded-full border border-white/25 px-5 py-3 font-semibold text-white"
            >
              WhatsApp Connect Flow
            </Link>
          </div>
        </header>

        <section className="card-grid">
          {featureCards.map(({ title, body, icon: Icon }) => (
            <article key={title} className="rounded-[28px] bg-white p-6 shadow-soft">
              <div className="inline-flex rounded-2xl bg-brand-50 p-3 text-brand-700">
                <Icon className="h-5 w-5" />
              </div>
              <h2 className="mt-5 text-2xl font-bold text-ink-900">{title}</h2>
              <p className="mt-3 text-base leading-8 text-ink-500">{body}</p>
            </article>
          ))}
        </section>
      </section>
    </main>
  );
}
