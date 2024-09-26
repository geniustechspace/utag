"use client";

import { useState, useMemo } from "react";

import { internalUrls } from "@/config/site-config";
import { withLoginRequired } from "@/providers/auth-provider/firebase/provider";
import { Sidebar } from "@/components/sidebar";
import { FeedbackProvider, useFeedbackModel } from "@/providers/models";
import { CreateFeedbackForm } from "@/components/forms/feedback-form";

const QnAPageLayout = ({ children }: { children: React.ReactNode }) => {
  const { feedbackCache } = useFeedbackModel();
  const [sidenavItems, setSidenavItems] = useState<
    { label: string; href: string }[]
  >([]);

  useMemo(() => {
    const feedbackArray = Object.values(feedbackCache); // Convert the cache into an array
    const items = feedbackArray.map((feedback) => ({
      label: feedback.subject,
      href: `${internalUrls.qna}/${feedback._id}`,
    }));

    setSidenavItems(items);
  }, [feedbackCache]);

  return (
    <FeedbackProvider>
      <main className="flex w-full max-w-screen-2xl mx-auto min-h-screen justify-between gap-3">
        <Sidebar items={sidenavItems} />
        <section className="w-full px-3 py-6">
          <CreateFeedbackForm />
          {children}
        </section>
      </main>
    </FeedbackProvider>
  );
};

export default withLoginRequired(QnAPageLayout);
