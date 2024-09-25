"use client";

import { siteConfig } from "@/config/site-config";
import { withLoginRequired } from "@/providers/auth-provider/firebase/provider";
import { Sidebar } from "@/components/sidebar";

const ConstitutionPageLayout = ({ children }: { children: React.ReactNode }) => {
  // const { documentCache } = useCons();
  // const [sidenavItems, setSidenavItems] = useState<
  //   { label: string; href: string }[]
  // >([]);

  // useMemo(() => {
  //   const documentArray = Object.values(documentCache); // Convert the cache into an array
  //   const items = documentArray.map((document) => ({
  //     label: `${document.document_title} (${document.document_type})`,
  //     href: `${internalUrls.documents}/${document.document_id}`,
  //   }));
  //   setSidenavItems(items);
  // }, [documentCache]);

  return (
    <>
      <main className="flex w-full max-w-screen-2xl mx-auto min-h-screen justify-between gap-3">
        <Sidebar items={siteConfig.navMenuItems} />
        <section className="w-full px-3 py-6">{children}</section>
      </main>
    </>
  );
};

export default withLoginRequired(ConstitutionPageLayout);
