"use client";

import { useMemo, useState } from "react";

import { internalUrls } from "@/config/site-config";
import { withLoginRequired } from "@/providers/auth-provider/firebase/provider";
import { Sidebar } from "@/components/sidebar";
import { usePromotionModel } from "@/providers/models";
import { CreatePromotionForm } from "@/components/forms/promotion-form";

const PromotionsPageLayout = ({ children }: { children: React.ReactNode }) => {
  const { promotionCache } = usePromotionModel();
  const [sidenavItems, setSidenavItems] = useState<
    { label: string; href: string }[]
  >([]);

  useMemo(() => {
    const promotionArray = Object.values(promotionCache); // Convert the cache into an array
    const items = promotionArray.map((promotion) => ({
      label: `${promotion.current_rank} - ${promotion.desired_rank}`,
      href: `${internalUrls.promotions}/${promotion.promotion_id}`,
    }));

    setSidenavItems(items);
  }, [promotionCache]);

  return (
    <>
      <main className="flex w-full max-w-screen-2xl mx-auto min-h-screen justify-between gap-3">
        {/* <Sidebar items={sidenavItems} /> */}
        <section className="w-full px-3 py-6">
          <CreatePromotionForm />
          {children}
        </section>
      </main>
    </>
  );
};

export default withLoginRequired(PromotionsPageLayout);
