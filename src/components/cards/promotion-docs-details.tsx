import { PromotionAttachment } from "@/providers/models";
import { Accordion, AccordionItem } from "@nextui-org/accordion";
import { Chip } from "@nextui-org/chip";
import { getFileIcon } from "../utils";

interface PromotionDocumentsDetailsProps {
  attachments: PromotionAttachment[];
}

export const PromotionDocumentsDetails = ({
  attachments,
}: PromotionDocumentsDetailsProps) => {
  const itemClasses = {
    base: "py-0 w-full border-none",
    title: "font-normal text-medium",
    trigger:
      "px-2 py-0 data-[hover=true]:bg-default-100 h-14 flex items-center",
    indicator: "text-medium",
    content: "text-small px-2",
  };

  return (
    <Accordion
      variant="light"
      className="p-2 flex flex-col gap-1 w-full"
      itemClasses={itemClasses}
    >
      {attachments.map((doc, idx) => (
        <AccordionItem
          key={doc.document_id}
          aria-label={doc.document_title}
          startContent={getFileIcon(doc.document_title.split(".").pop() || "")}
          title={
            <div className="flex justify-between">
              <h6 className="font-bold">{doc.document_title.toUpperCase()}</h6>
              <div className="flex gap-2">
                <Chip size="sm" radius="sm" variant="dot" color="primary">
                  {doc.document_type}
                </Chip>
                <Chip size="sm" radius="sm" variant="faded" color="primary">
                  SPP
                  {doc.sppCount ||
                    `${idx === 0 ? 1 : idx + 1 + 35 * idx}-${(idx + 1) * 36}`}
                </Chip>
                <Chip size="sm" radius="sm" variant="faded" color="primary">
                  Score: {doc.awardable_score || 9}
                </Chip>
              </div>
            </div>
          }
        >
          {doc.purpose}
        </AccordionItem>
      ))}
    </Accordion>
  );
};
