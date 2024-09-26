"use client";

import { useEffect } from "react";

import { DocumentCard } from "@/components/cards/document-card";
import { useDocumentModel } from "@/providers/models";

export default function DocumentsPage() {
  const { documentCache, getAllDocuments, deleteDocument } = useDocumentModel();

  useEffect(() => {
    const fetchDocuments = async () => {
      await getAllDocuments();
    };

    fetchDocuments();
  }, []);

  return (
    <div className="grid sm:grid-col-2 lg:grid-cols-3 gap-3">
      {Object.values(documentCache).map((document) => (
        <DocumentCard
          key={document.document_id}
          document={document}
          onDownload={(filePath) => window.open(filePath, "_blank")}
          onDelete={(document_id) => deleteDocument(document_id)}
        />
      ))}
    </div>
  );
}
