"use client";

import { useMemo, useState } from "react";

import { CreateMeetingForm } from "@/components/forms/meetings-form";
import { Sidebar } from "@/components/sidebar";
import { internalUrls } from "@/config/site-config";
import { useMeetingModel } from "@/providers/models";

export default function MeetingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { meetingCache } = useMeetingModel();
  const [sidenavItems, setSidenavItems] = useState<
    { label: string; href: string }[]
  >([]);

  useMemo(() => {
    const meetingArray = Object.values(meetingCache); // Convert the cache into an array
    const items = meetingArray.map((meeting) => ({
      label: `${meeting.title}`,
      href: `${internalUrls.meetings}/${meeting.meeting_id}`,
    }));

    setSidenavItems(items);
  }, [meetingCache]);

  return (
    <>
      <main className="flex w-full max-w-screen-2xl mx-auto min-h-screen justify-between gap-3">
        <Sidebar items={sidenavItems} />
        <section className="w-full px-3 py-6">
          <CreateMeetingForm />
          {children}
        </section>
      </main>
    </>
  );
}
