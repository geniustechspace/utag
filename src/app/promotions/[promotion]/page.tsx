"use client";

import { PromotionDocumentsDetails } from "@/components/cards/promotion-docs-details";
import { ComponentLoading } from "@/components/loading";
import { getFileIcon } from "@/components/utils";
import {
  Promotion,
  PromotionAttachment,
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
import PDFMerger from "pdf-merger-js";
import { PDFDocument, rgb } from "pdf-lib";

// Main component
const PromotionDetailPage = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { getUser } = useUserModel();
  const { getPromotion } = usePromotionModel();

  const [promotion, setPromotion] = useState<Promotion | null>(null);
  const [applicationUser, setApplicationUser] = useState<User | null>(null);
  const [isMerging, setIsMerging] = useState(false);

  // Extract promotion ID from URL
  const promotion_id = useMemo(() => pathname.split("/").pop(), [pathname]);

  useEffect(() => {
    const fetchPromotion = async () => {
      const _promotion = promotion_id ? await getPromotion(promotion_id) : null;
      setPromotion(_promotion);
    };
    fetchPromotion();
  }, [promotion_id, getPromotion]);

  useEffect(() => {
    const fetchApplicationUser = async () => {
      if (!promotion) return;
      const _user = await getUser(promotion.user_id);
      setApplicationUser(_user);
    };
    fetchApplicationUser();
  }, [promotion, getUser]);

  // Creates main cover page
  async function createMainCoverPage(
    promotion: Promotion,
  ): Promise<PDFDocument> {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595, 842]);
    const { width, height } = page.getSize();

    page.drawText("PROMOTION OF KNOWLEDGE", {
      x: width / 2 - 150,
      y: height - 100,
      size: 25,
      color: rgb(0, 0, 0),
    });
    page.drawText("UNIVERSITY OF ENERGY AND NATURAL RESOURCES", {
      x: 50,
      y: height - 150,
      size: 15,
      color: rgb(0, 0, 0),
    });
    page.drawText("DEPARTMENT OF COMPUTER SCIENCE AND INFORMATICS", {
      x: 50,
      y: height - 170,
      size: 15,
      color: rgb(0, 0, 0),
    });
    page.drawText(
      `EVIDENCE OF PROMOTION OF KNOWLEDGE FOR ${applicationUser?.name}`,
      { x: 50, y: height - 210, size: 14, color: rgb(0, 0, 0) },
    );
    page.drawText(`TO ${promotion.desired_rank}`, {
      x: 50,
      y: height - 230,
      size: 14,
      color: rgb(0, 0, 0),
    });
    page.drawText(promotion.application_date.toDate().toLocaleDateString(), {
      x: width - 150,
      y: height - 230,
      size: 14,
      color: rgb(0, 0, 0),
    });

    return pdfDoc;
  }

  // Creates Table of Contents
  async function createTableOfContent(
    attachments: PromotionAttachment[],
  ): Promise<PDFDocument> {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595, 842]);
    const { width, height } = page.getSize();

    page.drawText("TABLE OF CONTENT", {
      x: width / 2 - 100,
      y: height - 50,
      size: 20,
      color: rgb(0, 0, 0),
    });
    attachments.forEach((attachment, index) => {
      page.drawText(
        `${index + 1}. ${attachment.document_title}   SPP${attachment.sppCount || "N/A"}`,
        { x: 50, y: height - 100 - index * 20, size: 12, color: rgb(0, 0, 0) },
      );
    });

    return pdfDoc;
  }

  // Creates individual attachment cover pages
  async function createAttachmentCoverPage(
    attachment: PromotionAttachment,
  ): Promise<PDFDocument> {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595, 842]);
    const { width, height } = page.getSize();

    page.drawText(`Attachment: ${attachment.document_title}`, {
      x: 50,
      y: height - 100,
      size: 20,
      color: rgb(0, 0, 0),
    });
    page.drawText(`Document Type: ${attachment.document_type}`, {
      x: 50,
      y: height - 130,
      size: 14,
      color: rgb(0, 0, 0),
    });
    // page.drawText(`Awardable Score: ${attachment.awardable_score || "N/A"}`, {
    //   x: 50,
    //   y: height - 160,
    //   size: 14,
    //   color: rgb(0, 0, 0),
    // });
    // page.drawText(`Awarded Score: ${attachment.awarded_score || "N/A"}`, {
    //   x: 50,
    //   y: height - 190,
    //   size: 14,
    //   color: rgb(0, 0, 0),
    // });
    page.drawText(`SPP Count: ${attachment.sppCount || "N/A"}`, {
      x: 50,
      y: height - 220,
      size: 14,
      color: rgb(0, 0, 0),
    });

    return pdfDoc;
  }

  // Merge documents into a single PDF
  async function mergePromotionDocuments(promotion: Promotion) {
    setIsMerging(true);
    try {
      const merger = new PDFMerger();

      // Add Main Cover Page
      const coverPage = await createMainCoverPage(promotion);
      await merger.add(
        new Blob([await coverPage.save()], { type: "application/pdf" }),
      );

      // Add Table of Contents
      const tocPage = await createTableOfContent(promotion.attachments || []);
      await merger.add(
        new Blob([await tocPage.save()], { type: "application/pdf" }),
      );

      // Add CV and Attachments
      const documents: PromotionAttachment[] = [
        {
          document_id: "cv",
          document_title: "Curriculum Vitae",
          document_type: "CV",
          upload_date: promotion.application_date,
          uploader_id: promotion.user_id,
          fileUrl: promotion.cvUrl,
        },
        ...(promotion.attachments || []),
      ];

      for (const doc of documents) {
        // Add individual attachment cover pages
        const attachmentCover = await createAttachmentCoverPage(doc);
        await merger.add(
          new Blob([await attachmentCover.save()], { type: "application/pdf" }),
        );

        // Add the document itself
        const docBlob = await fetch(doc.fileUrl).then((res) => res.blob());
        await merger.add(docBlob);
      }

      // Create final merged PDF and trigger download
      const mergedBytes = await merger.saveAsBuffer();
      const downloadBlob = new Blob([mergedBytes], { type: "application/pdf" });
      const downloadUrl = URL.createObjectURL(downloadBlob);

      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = `Promotion_${promotion.promotion_id}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      setIsMerging(false);
    } catch (error) {
      console.error("Error merging PDF:", error);
      setIsMerging(false);
    }
  }

  // Render component
  if (!promotion) {
    return <ComponentLoading message="Loading promotion details..." />;
  }

  return (
    <Card radius="sm">
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
            <span>{promotion.assessment_score || 67}</span>
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
          onClick={() => window.open(promotion.cvUrl, "_blank")}
        >
          Download CV / Resume
        </Button>
        <Button
          radius="sm"
          color="primary"
          variant="ghost"
          onClick={() => mergePromotionDocuments(promotion)}
          isLoading={isMerging}
        >
          {isMerging ? "Merging documents..." : "Download application form"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PromotionDetailPage;
