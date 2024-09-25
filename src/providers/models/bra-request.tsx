import { db } from "@/config/firebase-config";
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

export interface BRARequest {
  bra_id: string;
  user_id: string;
  amount: number;
  status: "pending" | "approved" | "rejected" | "under review";
  submission_date: Date | any;
}

interface BRARequestModel {
  createBRARequest: (braRequest: BRARequest) => Promise<void>;
  updateBRARequest: (
    bra_id: string,
    braRequestData: Partial<BRARequest>,
  ) => Promise<void>;
  deleteBRARequest: (bra_id: string) => Promise<void>;
  getBRARequest: (bra_id: string) => Promise<BRARequest | null>;
  getAllBRARequests: (fetchLimit?: number) => Promise<BRARequest[]>;
  filterBRARequests: (filters: Partial<BRARequest>) => Promise<BRARequest[]>;
  subscribeToBRARequestUpdates: (
    callback: (braRequests: BRARequest[]) => void,
  ) => () => void;
  braRequestCache: Record<string, BRARequest>;
}

const BRARequestContext = createContext<BRARequestModel | null>(null);

export const BRARequestProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [braRequestCache, setBRARequestCache] = useState<
    Record<string, BRARequest>
  >({});

  const memoizedBRARequestCache = useMemo(
    () => braRequestCache,
    [braRequestCache],
  );

  // Create BRA request with error handling
  const createBRARequest = async (braRequest: BRARequest) => {
    try {
      const braRequestRef = doc(db, "bra_requests", braRequest.bra_id);
      const braRequestData: Partial<BRARequest> = { ...braRequest };

      // Remove undefined fields
      Object.keys(braRequestData).forEach((key) => {
        const typedKey = key as keyof BRARequest;
        if (braRequestData[typedKey] === undefined) {
          delete braRequestData[typedKey];
        }
      });

      await setDoc(braRequestRef, braRequestData);
      setBRARequestCache((prev) => ({
        ...prev,
        [braRequest.bra_id]: braRequest,
      }));
    } catch (error) {
      console.error("Error creating BRA request:", error);
      throw new Error("Unable to create BRA request.");
    }
  };

  // Update BRA request with error handling
  const updateBRARequest = async (
    bra_id: string,
    braRequestData: Partial<BRARequest>,
  ) => {
    try {
      const braRequestRef = doc(db, "bra_requests", bra_id);
      await updateDoc(braRequestRef, braRequestData);
      setBRARequestCache((prev) => ({
        ...prev,
        [bra_id]: { ...prev[bra_id], ...braRequestData },
      }));
    } catch (error) {
      console.error("Error updating BRA request:", error);
      throw new Error("Unable to update BRA request.");
    }
  };

  // Delete BRA request with error handling
  const deleteBRARequest = async (bra_id: string) => {
    try {
      const braRequestRef = doc(db, "bra_requests", bra_id);
      await deleteDoc(braRequestRef);
      setBRARequestCache((prev) => {
        const updatedCache = { ...prev };
        delete updatedCache[bra_id];
        return updatedCache;
      });
    } catch (error) {
      console.error("Error deleting BRA request:", error);
      throw new Error("Unable to delete BRA request.");
    }
  };

  // Get BRA request by ID with caching and error handling
  const getBRARequest = async (bra_id: string): Promise<BRARequest | null> => {
    if (memoizedBRARequestCache[bra_id]) return memoizedBRARequestCache[bra_id];

    try {
      const braRequestRef = doc(db, "bra_requests", bra_id);
      const braRequestDoc = await getDoc(braRequestRef);
      const braRequestData = braRequestDoc.exists()
        ? (braRequestDoc.data() as BRARequest)
        : null;

      if (braRequestData)
        setBRARequestCache((prev) => ({ ...prev, [bra_id]: braRequestData }));
      return braRequestData;
    } catch (error) {
      console.error("Error fetching BRA request:", error);
      throw new Error("Unable to fetch BRA request.");
    }
  };

  // Get all BRA requests with optional limit (pagination)
  const getAllBRARequests = async (fetchLimit = 50): Promise<BRARequest[]> => {
    try {
      const braRequestSnapshot = await getDocs(
        query(collection(db, "bra_requests"), limit(fetchLimit)),
      );
      const braRequests = braRequestSnapshot.docs.map(
        (doc) => doc.data() as BRARequest,
      );
      setBRARequestCache((prev) =>
        braRequests.reduce(
          (cache, braRequest) => ({
            ...cache,
            [braRequest.bra_id]: braRequest,
          }),
          prev,
        ),
      );
      return braRequests;
    } catch (error) {
      console.error("Error fetching BRA requests:", error);
      throw new Error("Unable to fetch BRA requests.");
    }
  };

  // Filter BRA requests by multiple fields
  const filterBRARequests = async (
    filters: Partial<BRARequest>,
  ): Promise<BRARequest[]> => {
    try {
      const braRequestRef = collection(db, "bra_requests");
      let braRequestQuery = query(braRequestRef);

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          braRequestQuery = query(
            braRequestQuery,
            where(key as keyof BRARequest, "==", value),
          );
        }
      });

      const filteredSnapshot = await getDocs(braRequestQuery);
      const braRequests = filteredSnapshot.docs.map(
        (doc) => doc.data() as BRARequest,
      );
      return braRequests;
    } catch (error) {
      console.error("Error filtering BRA requests:", error);
      throw new Error("Unable to filter BRA requests.");
    }
  };

  // Subscribe to real-time BRA request updates with caching
  const subscribeToBRARequestUpdates = (
    callback: (braRequests: BRARequest[]) => void,
  ) => {
    return onSnapshot(collection(db, "bra_requests"), (snapshot) => {
      const braRequests = snapshot.docs.map((doc) => doc.data() as BRARequest);
      setBRARequestCache((prev) =>
        braRequests.reduce(
          (cache, braRequest) => ({
            ...cache,
            [braRequest.bra_id]: braRequest,
          }),
          prev,
        ),
      );
      callback(braRequests);
    });
  };

  useEffect(() => {
    const unsubscribe = subscribeToBRARequestUpdates((updatedBRARequests) => {
      console.log("BRA requests updated:", updatedBRARequests);
    });

    // Prepopulate the cache on mount
    const fetchBRARequests = async () => {
      try {
        await getAllBRARequests();
      } catch (error) {
        console.error("Error during initial feedback fetch:", error);
      }
    };

    fetchBRARequests();

    return () => {
      unsubscribe(); // Cleanup on unmount
    };
  }, []);

  return (
    <BRARequestContext.Provider
      value={{
        createBRARequest,
        updateBRARequest,
        deleteBRARequest,
        getBRARequest,
        getAllBRARequests,
        filterBRARequests,
        subscribeToBRARequestUpdates,
        braRequestCache: memoizedBRARequestCache,
      }}
    >
      {children}
    </BRARequestContext.Provider>
  );
};

export const useBRARequestModel = () => {
  const context = useContext(BRARequestContext);

  if (!context)
    throw new Error(
      "useBRARequestModel must be used within a BRARequestProvider",
    );
  return context;
};
