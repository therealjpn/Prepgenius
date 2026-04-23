import { SubscribeClient } from "@/components/subscription/subscribe-client";
import { getUserProfile } from "@/lib/services/user.service";

export default async function SubscribePage() {
  const profile = await getUserProfile("demo-user");

  return (
    <SubscribeClient
      currentTier={profile.subscriptionTier}
      defaultEmail={profile.email ?? "demo@prepgenius.com.ng"}
      defaultPhone={profile.phone ?? "+2348012345678"}
      userId={profile.id}
    />
  );
}
