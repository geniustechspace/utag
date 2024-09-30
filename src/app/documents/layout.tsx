"use client";

import { withLoginRequired } from "@/providers/auth-provider/firebase/provider";
import { NewDocumentForm } from "@/components/forms/document-form";
import { PageHeader } from "@/components/page-header";
import { usePathname } from "next/navigation";
import { Document, useDocumentModel } from "@/providers/models";
import { internalUrls } from "@/config/site-config";
import { useState, useMemo, useEffect } from "react";
import { FiPlus } from "react-icons/fi";

const DocumentsPageLayout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();

  const { getDocument } = useDocumentModel();
  const [document, setDocument] = useState<Document | null>(null);

  // get the last segment of the URL path
  const document_id = useMemo(() => pathname.split("/").pop(), [pathname]);

  // fetch Document for details
  useEffect(() => {
    const fetchDocument = async () => {
      if (!document_id) return; // Ensure document_id is available
      try {
        const _document = await getDocument(document_id);

        setDocument(_document);
      } catch (err) {
        console.error("Error fetching document:", err);
      }
    };

    fetchDocument();
  }, [document_id]);

  const title =
    pathname === internalUrls.documents
      ? "Documents"
      : document?.document_title;

  return (
    <>
      <main className="w-full max-w-screen-2xl px-3">
        <PageHeader title={title ? title : "---"}>
          <NewDocumentForm multiple startContent={<FiPlus />} />
        </PageHeader>
        {children}
      </main>
    </>
  );
};

export default withLoginRequired(DocumentsPageLayout);
