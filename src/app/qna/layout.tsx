"use client";

import { siteConfig } from "@/config/site-config";
import { withLoginRequired } from "@/providers/auth-provider/firebase/provider";
import { Sidebar } from "@/components/sidebar";

const QnAPageLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <main className="flex w-full max-w-screen-2xl mx-auto min-h-screen justify-between gap-3">
        <Sidebar items={siteConfig.navMenuItems} />
        <section className="w-full px-3 py-6">{children}</section>
      </main>
    </>
  );
};

export default withLoginRequired(QnAPageLayout);
