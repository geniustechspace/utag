"use client";

import { withLoginRequired } from "@/providers/auth-provider/firebase/provider";
import { CreateDocumentForm } from "@/components/forms/document-form";

const DocumentsPageLayout = ({ children }: { children: React.ReactNode }) => {

  return (
    <>
      <main className="flex w-full max-w-screen-2xl mx-auto min-h-screen justify-between gap-3">
        <section className="w-full px-3 py-6">
          <CreateDocumentForm />
          {children}
        </section>
      </main>
    </>
  );
};

export default withLoginRequired(DocumentsPageLayout);
