"use client";

import { DocumentCard } from "@/components/cards/document-card";
import { useDocumentModel } from "@/providers/models";
import { useEffect } from "react";

export default function DocumentsPage() {
  const { documentCache, getDocument, getAllDocuments, deleteDocument } =
    useDocumentModel();

  useEffect(() => {
    const fetchDocuments = async () => {
      await getAllDocuments();
    };

    fetchDocuments();
  }, []);

  return (
    <div className="grid sm:grid-col-2 lg:grid-cols-3">
      {Object.values(documentCache).map((document) => (
        <DocumentCard
          document={document}
          onDownload={(filePath) => window.open(filePath, "_blank")}
          onDelete={(document_id) => deleteDocument(document_id)}
        />
      ))}
    </div>
  );
}
