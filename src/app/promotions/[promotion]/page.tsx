"use client";

import { PromotionDocumentsDetails } from "@/components/cards/promotion-docs-details";
import { ComponentLoading, ElevatedLoading } from "@/components/loading";
import { getFileIcon } from "@/components/utils";
import {
  Promotion,
  usePromotionModel,
  User,
  useUserModel,
} from "@/providers/models";
import { Avatar } from "@nextui-org/avatar";
import { Button } from "@nextui-org/button";
import { Card, CardBody, CardFooter, CardHeader } from "@nextui-org/card";
import { Chip } from "@nextui-org/chip";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

const PromotionDetailPage = () => {
  const pathname = usePathname();
  const router = useRouter();

  const { getUser } = useUserModel();
  const { getPromotion } = usePromotionModel();

  const [promotion, setPromotion] = useState<Promotion | null>(null);
  const [applicationUser, setApplicationUser] = useState<User | null>(null);

  // get the last segment of the URL path
  const promotion_id = useMemo(() => pathname.split("/").pop(), [pathname]);

  useEffect(() => {
    const fetchPromotion = async () => {
      const _promotion = promotion_id ? await getPromotion(promotion_id) : null;
      setPromotion(_promotion);
    };
    fetchPromotion();
  }, [promotion_id]);

  useEffect(() => {
    const fetchApplicationUser = async () => {
      if (!promotion) return;
      const _user = await getUser(promotion.user_id);
      setApplicationUser(_user);
    };

    fetchApplicationUser();
  }, [promotion]);

  const handleDownloadPDF = () => {
    // const doc = new jsPDF();
    // doc.setFontSize(18);
    // doc.pa("Promotion Details", 14, 22);
    // doc.setFontSize(12);
    // doc.p(`Promotion ID: ${promotion.promotion_id}`, 14, 32);
    // doc.p(`User ID: ${promotion.user_id}`, 14, 42);
    // doc.p(`Current Rank: ${promotion.current_rank}`, 14, 52);
    // doc.p(`Desired Rank: ${promotion.desired_rank}`, 14, 62);
    // doc.p(
    //   `Application Date: ${new Date(promotion.application_date).toLocaleDateString()}`,
    //   14,
    //   72,
    // );
    // doc.p(`Status: ${promotion.status}`, 14, 82);
    // doc.p(
    //   `Assessment Score: ${promotion.assessment_score ?? "N/A"}`,
    //   14,
    //   92,
    // );
    // if (promotion.attachments?.length) {
    //   autoTable(doc, {
    //     startY: 102,
    //     head: [
    //       ["Type", "Purpose", "Awardable Score", "Awarded Score", "Pages"],
    //     ],
    //     body: promotion.attachments.map((attachment) => [
    //       attachment.type,
    //       attachment.purpose,
    //       attachment.awardable_score ?? "N/A",
    //       attachment.awarded_score ?? "N/A",
    //       attachment.pages ?? "N/A",
    //     ]),
    //   });
    // }
    // doc.save("promotion-details.pdf");
  };

  if (!promotion) {
    return <ComponentLoading message="Loading promotion details ..." />;
  }

  return (
    <Card radius="sm" className="">
      <CardHeader className="flex-row justify-between px-6">
        <div className="flex items-center gap-3">
          <Avatar size="lg">{applicationUser?.name[0].toUpperCase()}</Avatar>
          <div>
            <h2 className="text-xl font-bold">
              {applicationUser?.name || promotion.current_rank}
            </h2>
            <h3 className="text-default-500">
              Desired Rank: {promotion.desired_rank}
            </h3>
          </div>
        </div>

        <div className="mt-4 gap-6">
          <div className="flex justify-between gap-2">
            <span className="font-semibold">Application Date:</span>
            <span>
              {promotion.application_date.toDate().toLocaleDateString()}
            </span>
          </div>
          <div className="flex justify-between gap-2">
            <span className="font-semibold">Assessment score:</span>
            {promotion.assessment_score || 67}
          </div>
          <div className="flex justify-between gap-2">
            <span className="font-semibold">Status:</span>
            <Chip
              size="sm"
              radius="sm"
              variant="dot"
              color={promotion.status === "approved" ? "success" : "warning"}
            >
              {promotion.status}
            </Chip>
          </div>
          {promotion.assessment_score && (
            <div className="flex justify-between">
              <span className="font-semibold">Assessment Score:</span>
              <span>{promotion.assessment_score}</span>
            </div>
          )}
        </div>
      </CardHeader>

      <CardBody>
        <h3 className="text-lg font-bold text-center uppercase">
          Supporting documents
        </h3>
        {promotion.attachments && promotion.attachments.length > 0 && (
          <PromotionDocumentsDetails attachments={promotion.attachments} />
        )}
      </CardBody>

      <CardFooter className="gap-3 justify-end">
        <Button
          radius="sm"
          color="primary"
          variant="ghost"
          startContent={getFileIcon(promotion.cvUrl.split(".").pop() || "")}
          className="ps-1"
        >
          Download CV / Resume
        </Button>
        <Button radius="sm" color="primary" variant="ghost">
          Download documents
        </Button>
        <Button radius="sm" color="primary" variant="ghost">
          Download aplication form
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PromotionDetailPage;
