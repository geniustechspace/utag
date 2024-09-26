import {
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  collection,
  query,
  where,
  onSnapshot,
  limit,
} from "firebase/firestore";
import { useState, useEffect, useContext, createContext, useMemo } from "react";

import { db } from "@/config/firebase-config";

// Document interface
export interface Document {
  document_id: string;
  document_title: string;
  document_type: string;
  upload_date: Date | any;
  uploader_id: string; // References a user_id
  file_path: string;
}

interface DocumentModel {
  createDocument: (doc: Document) => Promise<void>;
  updateDocument: (
    document_id: string,
    docData: Partial<Document>,
  ) => Promise<void>;
  deleteDocument: (document_id: string) => Promise<void>;
  getDocument: (document_id: string) => Promise<Document | null>;
  getAllDocuments: (fetchLimit?: number) => Promise<Document[]>;
  filterDocuments: (filters: Partial<Document>) => Promise<Document[]>;
  subscribeToDocumentUpdates: (
    callback: (docs: Document[]) => void,
  ) => () => void;
  documentCache: Record<string, Document>;
}

const DocumentContext = createContext<DocumentModel | null>(null);

export const DocumentProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [documentCache, setDocumentCache] = useState<Record<string, Document>>(
    {},
  );

  // Memoize the document cache to avoid unnecessary re-renders
  const memoizedDocumentCache = useMemo(() => documentCache, [documentCache]);

  // Create a document with error handling
  const createDocument = async (document: Document) => {
    try {
      const documentRef = doc(db, "Documents", document.document_id);
      const documentData: Partial<Document> = { ...document };

      // Remove undefined fields
      Object.keys(documentData).forEach((key) => {
        const typedKey = key as keyof Document;

        if (documentData[typedKey] === undefined) {
          delete documentData[typedKey];
        }
      });

      await setDoc(documentRef, documentData);
      setDocumentCache((prev) => ({
        ...prev,
        [document.document_id]: document,
      }));
    } catch (error) {
      console.error("Error creating document:", error);
      throw new Error("Unable to create document.");
    }
  };

  // Update a document with error handling
  const updateDocument = async (
    document_id: string,
    docData: Partial<Document>,
  ) => {
    try {
      const documentRef = doc(db, "Documents", document_id);

      await updateDoc(documentRef, docData);
      setDocumentCache((prev) => ({
        ...prev,
        [document_id]: { ...prev[document_id], ...docData },
      }));
    } catch (error) {
      console.error("Error updating document:", error);
      throw new Error("Unable to update document.");
    }
  };

  // Delete a document with error handling
  const deleteDocument = async (document_id: string) => {
    try {
      const documentRef = doc(db, "Documents", document_id);

      await deleteDoc(documentRef);
      setDocumentCache((prev) => {
        const updatedCache = { ...prev };

        delete updatedCache[document_id];

        return updatedCache;
      });
    } catch (error) {
      console.error("Error deleting document:", error);
      throw new Error("Unable to delete document.");
    }
  };

  // Get a document by ID with caching and error handling
  const getDocument = async (document_id: string): Promise<Document | null> => {
    if (memoizedDocumentCache[document_id])
      return memoizedDocumentCache[document_id];

    try {
      const documentRef = doc(db, "Documents", document_id);
      const documentDoc = await getDoc(documentRef);
      const documentData = documentDoc.exists()
        ? (documentDoc.data() as Document)
        : null;

      if (documentData) {
        setDocumentCache((prev) => ({ ...prev, [document_id]: documentData }));
      }

      return documentData;
    } catch (error) {
      console.error("Error fetching document:", error);
      throw new Error("Unable to fetch document.");
    }
  };

  // Get all documents with an optional limit (pagination)
  const getAllDocuments = async (fetchLimit = 50): Promise<Document[]> => {
    try {
      const documentsSnapshot = await getDocs(
        query(collection(db, "Documents"), limit(fetchLimit)),
      );
      const documents = documentsSnapshot.docs.map(
        (doc) => doc.data() as Document,
      );

      setDocumentCache((prev) =>
        documents.reduce(
          (cache, doc) => ({ ...cache, [doc.document_id]: doc }),
          prev,
        ),
      );

      return documents;
    } catch (error) {
      console.error("Error fetching documents:", error);
      throw new Error("Unable to fetch documents.");
    }
  };

  // Filter documents by multiple fields
  const filterDocuments = async (
    filters: Partial<Document>,
  ): Promise<Document[]> => {
    try {
      const documentRef = collection(db, "Documents");
      let documentQuery = query(documentRef);

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          documentQuery = query(
            documentQuery,
            where(key as keyof Document, "==", value),
          );
        }
      });

      const filteredSnapshot = await getDocs(documentQuery);
      const documents = filteredSnapshot.docs.map(
        (doc) => doc.data() as Document,
      );

      return documents;
    } catch (error) {
      console.error("Error filtering documents:", error);
      throw new Error("Unable to filter documents.");
    }
  };

  // Subscribe to real-time document updates
  const subscribeToDocumentUpdates = (callback: (docs: Document[]) => void) => {
    return onSnapshot(collection(db, "Documents"), (snapshot) => {
      const documents = snapshot.docs.map((doc) => doc.data() as Document);

      setDocumentCache((prev) =>
        documents.reduce(
          (cache, doc) => ({ ...cache, [doc.document_id]: doc }),
          prev,
        ),
      );
      callback(documents);
    });
  };

  useEffect(() => {
    const unsubscribe = subscribeToDocumentUpdates((updatedDocuments) => {
      console.log("Documents updated:", updatedDocuments);
    });

    // Prepopulate the cache on mount
    const fetchDocuments = async () => {
      try {
        await getAllDocuments();
      } catch (error) {
        console.error("Error during initial feedback fetch:", error);
      }
    };

    fetchDocuments();

    return () => {
      unsubscribe(); // Cleanup on unmount
    };
  }, []);

  return (
    <DocumentContext.Provider
      value={{
        createDocument,
        updateDocument,
        deleteDocument,
        getDocument,
        getAllDocuments,
        filterDocuments,
        subscribeToDocumentUpdates,
        documentCache: memoizedDocumentCache,
      }}
    >
      {children}
    </DocumentContext.Provider>
  );
};

export const useDocumentModel = () => {
  const context = useContext(DocumentContext);

  if (!context)
    throw new Error("useDocumentModel must be used within a DocumentProvider");

  return context;
};
