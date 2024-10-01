"use client";

import { useAuth, withLoginRequired } from "@/providers/auth-provider";

import { MeetingSummaryCard } from "@/components/cards/meetings-stats-card";
import { UserProfileCard } from "@/components/cards/user-profile-card";
import { ElevatedLoading } from "@/components/loading";

const HomePage = () => {
  const { user } = useAuth();

  if (!user) return <ElevatedLoading />;

  return (
    <section className="flex gap-3">
      <UserProfileCard user={user} />
      <MeetingSummaryCard />
    </section>
  );
};

export default withLoginRequired(HomePage);
