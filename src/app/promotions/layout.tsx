"use client";

import NextLink from "next/link";
import { useEffect, useMemo, useState } from "react";

import { internalUrls } from "@/config/site-config";
import { withLoginRequired } from "@/providers/auth-provider/firebase/provider";
import { Promotion, usePromotionModel } from "@/providers/models";
import { Button } from "@nextui-org/button";
import { FiArrowLeftCircle, FiPlus } from "react-icons/fi";
import { usePathname } from "next/navigation";
import { PageHeader } from "@/components/page-header";

const PromotionsPageLayout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();

  const { getPromotion } = usePromotionModel();
  const [promotion, setPromotion] = useState<Promotion | null>(null);

  // get the last segment of the URL path
  const promotion_id = useMemo(() => pathname.split("/").pop(), [pathname]);

  // fetch Promotion for details
  useEffect(() => {
    const fetchPromotion = async () => {
      if (!promotion_id) return; // Ensure promotion_id is available
      try {
        const _promotion = await getPromotion(promotion_id);

        setPromotion(_promotion);
      } catch (err) {
        console.error("Error fetching promotion:", err);
      }
    };

    fetchPromotion();
  }, [promotion_id]);

  const title =
    pathname === internalUrls.promotions
      ? "Promotions"
      : pathname === internalUrls.newPromotion
        ? "Promotion of Knowledge Portal"
        : `${promotion?.current_rank} - ${promotion?.desired_rank}`;

  return (
    <>
      <main className="w-full max-w-screen-2xl px-3">
        <PageHeader title={title}>
          <Button
            as={NextLink}
            href={internalUrls.newPromotion}
            size="sm"
            radius="sm"
            color="primary"
            variant="ghost"
            startContent={<FiPlus />}
          >
            New Promotion
          </Button>
        </PageHeader>

        {children}
      </main>
    </>
  );
};

export default withLoginRequired(PromotionsPageLayout);
