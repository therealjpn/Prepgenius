import { AppShell } from "@/components/layout/app-shell";
import { TutorChat } from "@/components/tutor/tutor-chat";

export default function TutorPage() {
  return (
    <AppShell
      title="AI Tutor"
      subtitle="The tutor prompt is shared across web and WhatsApp, so explanations stay consistent even when students switch channels."
    >
      <TutorChat subject="Mathematics" />
    </AppShell>
  );
}

