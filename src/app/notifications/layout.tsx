"use client";

import { siteConfig } from "@/config/site-config";
import { withLoginRequired } from "@/providers/auth-provider/firebase/provider";
import { Sidebar } from "@/components/sidebar";

const NotificationsPageLayout = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  // const { promotionCache } = useNotificationModel();
  // const [sidenavItems, setSidenavItems] = useState<
  //   { label: string; href: string }[]
  // >([]);

  // useMemo(() => {
  //   const promotionArray = Object.values(promotionCache); // Convert the cache into an array
  //   const items = promotionArray.map((promotion) => ({
  //     label: `${promotion.current_rank} - ${promotion.desired_rank}`,
  //     href: `${internalUrls.promotions}/${promotion.promotion_id}`,
  //   }));
  //   setSidenavItems(items);
  // }, [promotionCache]);

  return (
    <>
      <main className="flex w-full max-w-screen-2xl mx-auto min-h-screen justify-between gap-3">
        <Sidebar items={siteConfig.navMenuItems} />
        <section className="w-full px-3 py-6">{children}</section>
      </main>
    </>
  );
};

export default withLoginRequired(NotificationsPageLayout);
