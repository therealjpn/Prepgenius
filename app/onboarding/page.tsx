import Link from "next/link";
import { BrandLockup } from "@/components/layout/brand-lockup";
import { subjectCatalog } from "@/lib/data/subjects";

export default function OnboardingPage() {
  const exams = ["JAMB", "WAEC", "NECO", "ICAN"];

  return (
    <main className="min-h-screen bg-hero-glow px-4 py-8">
      <section className="mx-auto max-w-2xl rounded-[36px] bg-white p-6 shadow-soft md:p-8">
        <BrandLockup theme="dark" />
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-700">Onboarding</p>
        <h1 className="mt-2 text-3xl font-bold">Let’s personalize your prep.</h1>
        <p className="mt-3 text-sm leading-7 text-ink-500">
          This starter screen represents the three-step onboarding flow. It captures exam, subjects, and exam date before generating a study plan.
        </p>

        <div className="mt-6 grid gap-5">
          <article className="rounded-[24px] bg-background p-5">
            <p className="font-semibold">1. Which exam are you preparing for?</p>
            <div className="mt-3 flex flex-wrap gap-3">
              {exams.map((exam) => (
                <span key={exam} className="rounded-full bg-white px-4 py-2 text-sm font-medium text-ink-900 shadow-sm">
                  {exam}
                </span>
              ))}
            </div>
          </article>

          <article className="rounded-[24px] bg-background p-5">
            <p className="font-semibold">2. Select your subjects</p>
            <div className="mt-3 flex flex-wrap gap-3 text-sm text-ink-500">
              {subjectCatalog.slice(0, 6).map((subject) => (
                <span key={subject.slug} className="rounded-full bg-white px-4 py-2 shadow-sm">
                  {subject.name}
                </span>
              ))}
            </div>
          </article>

          <article className="rounded-[24px] bg-background p-5">
            <p className="font-semibold">3. Choose exam date and create plan</p>
            <p className="mt-2 text-sm text-ink-500">Hook this screen to Supabase auth + profile persistence when env keys are available.</p>
          </article>
        </div>

        <div className="mt-6 flex gap-3">
          <Link href="/dashboard" className="rounded-full bg-brand-700 px-5 py-3 font-semibold text-white">
            Continue to App
          </Link>
          <Link href="/whatsapp" className="rounded-full border border-brand-200 px-5 py-3 font-semibold text-brand-700">
            Link WhatsApp
          </Link>
        </div>
      </section>
    </main>
  );
}
