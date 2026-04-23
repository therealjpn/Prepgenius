import { AppShell } from "@/components/layout/app-shell";
import { PracticeShell } from "@/components/practice/practice-shell";
import { startPracticeSession } from "@/lib/services/practice.service";

export default async function PracticePage() {
  const session = await startPracticeSession({
    userId: "demo-user",
    platform: "web",
    examType: "jamb",
    subject: "Mathematics",
    topic: "Quadratic Equations"
  });

  return (
    <AppShell
      title="Practice Questions"
      subtitle="One-question-per-screen flow built for mobile. The same session model powers both the web practice view and WhatsApp chat practice."
    >
      <PracticeShell initialSession={session} />
    </AppShell>
  );
}

