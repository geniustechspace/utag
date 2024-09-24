import { Sidebar } from "@/components/sidebar";
import { siteConfig } from "@/config/site-config";

export default function MeetingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <main className="flex w-full max-w-screen-2xl mx-auto min-h-screen justify-between gap-3">
        <Sidebar items={siteConfig.navMenuItems} />
        <section className="w-full px-3 py-6">{children}</section>
      </main>
    </>
  );
}
