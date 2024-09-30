"use client";

import { ElevatedLoading } from "@/components/loading";
import { useAuth } from "@/providers/auth-provider";
import { Promotion, usePromotionModel } from "@/providers/models";
import { Button } from "@nextui-org/button";
import { Card, CardBody } from "@nextui-org/card";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

const PromotionDetailPage = () => {
  const pathname = usePathname();
  const router = useRouter();

  const { user } = useAuth();
  const { getPromotion } = usePromotionModel();

  const [promotion, setPromotion] = useState<Promotion | null>(null);

  // get the last segment of the URL path
  const promotion_id = useMemo(() => pathname.split("/").pop(), [pathname]);

  useEffect(() => {
    const fetchPromotion = async () => {
      const _promotion = promotion_id ? await getPromotion(promotion_id) : null;
      setPromotion(_promotion);
    };
    fetchPromotion();
  }, []);

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

  if (!promotion) return router.replace("/not-found");

  return (
    <div className="flex flex-col items-center justify-center p-6">
      <Card className="w-full max-w-3xl">
        <CardBody>
          <p className="p-center">Promotion Details</p>
          <div className="mt-4">
            <p>Promotion ID: {promotion.promotion_id}</p>
            <p>User ID: {promotion.user_id}</p>
            <p>Current Rank: {promotion.current_rank}</p>
            <p>Desired Rank: {promotion.desired_rank}</p>
            <p>
              Application Date:{" "}
              {new Date(promotion.application_date).toLocaleDateString()}
            </p>
            <p>Status: {promotion.status}</p>
            <p>Assessment Score: {promotion.assessment_score ?? "N/A"}</p>

            <p className="mt-6">Attachments:</p>
            {promotion.attachments?.length ? (
              <ul className="list-disc ml-6">
                {promotion.attachments.map((attachment, index) => (
                  <li key={index}>
                    <p>
                      {attachment.document_type} - {attachment.purpose} (
                      <a href={attachment.document_id} className="p-blue-500">
                        View Attachment
                      </a>
                      )
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No attachments available.</p>
            )}
          </div>
        </CardBody>
      </Card>

      <Button className="mt-6" onClick={handleDownloadPDF}>
        Download PDF
      </Button>
    </div>
  );
};

export default PromotionDetailPage;
