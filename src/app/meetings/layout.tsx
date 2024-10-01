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
  return (
    <>
      <main className="w-full max-w-screen-2xl">
        <section className="w-full px-3 py-6">
          <CreateMeetingForm />
          {children}
        </section>
      </main>
    </>
  );
}
