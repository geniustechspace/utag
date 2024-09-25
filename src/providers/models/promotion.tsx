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

export interface Promotion {
  promotion_id: string;
  user_id: string;
  current_rank: string;
  desired_rank: string;
  application_date: Date | any;
  status: "pending" | "approved" | "rejected" | "under review";
  assessment_score?: number; // Optional, might be undefined at first
  attachments?: string[]; // URLs of attached documents
}

interface PromotionModel {
  createPromotion: (promotion: Promotion) => Promise<void>;
  updatePromotion: (
    promotion_id: string,
    promotionData: Partial<Promotion>,
  ) => Promise<void>;
  deletePromotion: (promotion_id: string) => Promise<void>;
  getPromotion: (promotion_id: string) => Promise<Promotion | null>;
  getAllPromotions: (fetchLimit?: number) => Promise<Promotion[]>;
  filterPromotions: (filters: Partial<Promotion>) => Promise<Promotion[]>;
  subscribeToPromotionUpdates: (
    callback: (promotions: Promotion[]) => void,
  ) => () => void;
  promotionCache: Record<string, Promotion>;
}

const PromotionContext = createContext<PromotionModel | null>(null);

export const PromotionProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [promotionCache, setPromotionCache] = useState<
    Record<string, Promotion>
  >({});

  // Memoize promotion cache to prevent unnecessary re-renders
  const memoizedPromotionCache = useMemo(
    () => promotionCache,
    [promotionCache],
  );

  // Create promotion with error handling
  const createPromotion = async (promotion: Promotion) => {
    try {
      const promotionRef = doc(db, "Promotions", promotion.promotion_id);
      const promotionData: Partial<Promotion> = { ...promotion };

      // Remove undefined fields
      Object.keys(promotionData).forEach((key) => {
        const typedKey = key as keyof Promotion;
        if (promotionData[typedKey] === undefined) {
          delete promotionData[typedKey];
        }
      });

      await setDoc(promotionRef, promotionData);
      setPromotionCache((prev) => ({
        ...prev,
        [promotion.promotion_id]: promotion,
      }));
    } catch (error) {
      console.error("Error creating promotion:", error);
      throw new Error("Unable to create promotion.");
    }
  };

  // Update promotion with error handling
  const updatePromotion = async (
    promotion_id: string,
    promotionData: Partial<Promotion>,
  ) => {
    try {
      const promotionRef = doc(db, "Promotions", promotion_id);
      await updateDoc(promotionRef, promotionData);
      setPromotionCache((prev) => ({
        ...prev,
        [promotion_id]: { ...prev[promotion_id], ...promotionData },
      }));
    } catch (error) {
      console.error("Error updating promotion:", error);
      throw new Error("Unable to update promotion.");
    }
  };

  // Delete promotion with error handling
  const deletePromotion = async (promotion_id: string) => {
    try {
      const promotionRef = doc(db, "Promotions", promotion_id);
      await deleteDoc(promotionRef);
      setPromotionCache((prev) => {
        const updatedCache = { ...prev };
        delete updatedCache[promotion_id];
        return updatedCache;
      });
    } catch (error) {
      console.error("Error deleting promotion:", error);
      throw new Error("Unable to delete promotion.");
    }
  };

  // Get promotion by ID with caching and error handling
  const getPromotion = async (
    promotion_id: string,
  ): Promise<Promotion | null> => {
    if (memoizedPromotionCache[promotion_id])
      return memoizedPromotionCache[promotion_id];

    try {
      const promotionRef = doc(db, "Promotions", promotion_id);
      const promotionDoc = await getDoc(promotionRef);
      const promotionData = promotionDoc.exists()
        ? (promotionDoc.data() as Promotion)
        : null;

      if (promotionData)
        setPromotionCache((prev) => ({
          ...prev,
          [promotion_id]: promotionData,
        }));
      return promotionData;
    } catch (error) {
      console.error("Error fetching promotion:", error);
      throw new Error("Unable to fetch promotion.");
    }
  };

  // Get all promotions with optional limit (pagination)
  const getAllPromotions = async (fetchLimit = 50): Promise<Promotion[]> => {
    try {
      const promotionSnapshot = await getDocs(
        query(collection(db, "Promotions"), limit(fetchLimit)),
      );
      const promotions = promotionSnapshot.docs.map(
        (doc) => doc.data() as Promotion,
      );
      setPromotionCache((prev) =>
        promotions.reduce(
          (cache, promotion) => ({
            ...cache,
            [promotion.promotion_id]: promotion,
          }),
          prev,
        ),
      );
      return promotions;
    } catch (error) {
      console.error("Error fetching promotions:", error);
      throw new Error("Unable to fetch promotions.");
    }
  };

  // Filter promotions by multiple fields
  const filterPromotions = async (
    filters: Partial<Promotion>,
  ): Promise<Promotion[]> => {
    try {
      const promotionRef = collection(db, "Promotions");
      let promotionQuery = query(promotionRef);

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          promotionQuery = query(
            promotionQuery,
            where(key as keyof Promotion, "==", value),
          );
        }
      });

      const filteredSnapshot = await getDocs(promotionQuery);
      const promotions = filteredSnapshot.docs.map(
        (doc) => doc.data() as Promotion,
      );
      return promotions;
    } catch (error) {
      console.error("Error filtering promotions:", error);
      throw new Error("Unable to filter promotions.");
    }
  };

  // Subscribe to real-time promotion updates with caching
  const subscribeToPromotionUpdates = (
    callback: (promotions: Promotion[]) => void,
  ) => {
    return onSnapshot(collection(db, "Promotions"), (snapshot) => {
      const promotions = snapshot.docs.map((doc) => doc.data() as Promotion);
      setPromotionCache((prev) =>
        promotions.reduce(
          (cache, promotion) => ({
            ...cache,
            [promotion.promotion_id]: promotion,
          }),
          prev,
        ),
      );
      callback(promotions);
    });
  };

  useEffect(() => {
    const unsubscribe = subscribeToPromotionUpdates((updatedPromotions) => {
      console.log("Promotions updated:", updatedPromotions);
    });

    // Prepopulate the cache on mount
    const fetchPromotions = async () => {
      try {
        await getAllPromotions();
      } catch (error) {
        console.error("Error during initial fetch:", error);
      }
    };

    fetchPromotions();

    return () => {
      unsubscribe(); // Cleanup on unmount
    };
  }, []);

  return (
    <PromotionContext.Provider
      value={{
        createPromotion,
        updatePromotion,
        deletePromotion,
        getPromotion,
        getAllPromotions,
        filterPromotions,
        subscribeToPromotionUpdates,
        promotionCache: memoizedPromotionCache,
      }}
    >
      {children}
    </PromotionContext.Provider>
  );
};

export const usePromotionModel = () => {
  const context = useContext(PromotionContext);

  if (!context)
    throw new Error(
      "usePromotionModel must be used within a PromotionProvider",
    );
  return context;
};
