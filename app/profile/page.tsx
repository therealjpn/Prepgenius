import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { getUserProfile } from "@/lib/services/user.service";

export default async function ProfilePage() {
  const profile = await getUserProfile("demo-user");

  return (
    <AppShell
      title="Profile & Settings"
      subtitle="Account, subscription, referral, and linked-channel settings live here so the product feels like one system rather than two separate apps."
    >
      <article className="rounded-[28px] bg-white p-6 shadow-soft">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-700">Student Profile</p>
        <div className="mt-4 grid gap-4 text-sm text-ink-500">
          <p>
            <span className="font-semibold text-ink-900">Name:</span> {profile.fullName}
          </p>
          <p>
            <span className="font-semibold text-ink-900">Exam:</span> {profile.examType.toUpperCase()}
          </p>
          <p>
            <span className="font-semibold text-ink-900">Subscription:</span> {profile.subscriptionTier}
          </p>
          <p>
            <span className="font-semibold text-ink-900">Referral code:</span> {profile.referralCode}
          </p>
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/subscribe" className="rounded-full bg-brand-700 px-5 py-3 font-semibold text-white">
            Manage Plan
          </Link>
          <Link href="/whatsapp" className="rounded-full border border-brand-200 px-5 py-3 font-semibold text-brand-700">
            Link WhatsApp
          </Link>
        </div>
      </article>
    </AppShell>
  );
}

