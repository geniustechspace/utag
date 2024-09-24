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

export interface Feedback {
  _id: string;
  user_id: string;
  type: "question" | "discussion" | "complaint";
  subject: string;
  message: string;
  attachments?: string[]; // URLs of attached files
  target_group:
    | "Members"
    | "Secretary"
    | "President"
    | "Treasurer"
    | "Vice President"
    | "Electoral Commissioner";
  response?: Feedback[]; // Array of feedback (for nested responses)
  read_status?: string[]; // Array of user_ids who have read the feedback
  submitted_date: Date | any;
}

interface FeedbackModel {
  createFeedback: (feedback: Feedback) => Promise<void>;
  updateFeedback: (
    feedback_id: string,
    feedbackData: Partial<Feedback>,
  ) => Promise<void>;
  deleteFeedback: (feedback_id: string) => Promise<void>;
  getFeedback: (feedback_id: string) => Promise<Feedback | null>;
  getAllFeedbacks: (fetchLimit?: number) => Promise<Feedback[]>;
  filterFeedbacks: (filters: Partial<Feedback>) => Promise<Feedback[]>;
  subscribeToFeedbackUpdates: (
    callback: (feedbacks: Feedback[]) => void,
  ) => () => void;
  feedbackCache: Record<string, Feedback>;
}

const FeedbackContext = createContext<FeedbackModel | null>(null);

export const FeedbackProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [feedbackCache, setFeedbackCache] = useState<Record<string, Feedback>>(
    {},
  );

  // Memoize feedback cache to prevent unnecessary re-renders
  const memoizedFeedbackCache = useMemo(() => feedbackCache, [feedbackCache]);

  // Create feedback with error handling
  const createFeedback = async (feedback: Feedback) => {
    try {
      const feedbackRef = doc(db, "Feedbacks", feedback._id);
      const feedbackData: Partial<Feedback> = { ...feedback };

      // Remove undefined fields
      Object.keys(feedbackData).forEach((key) => {
        const typedKey = key as keyof Feedback;
        if (feedbackData[typedKey] === undefined) {
          delete feedbackData[typedKey];
        }
      });

      await setDoc(feedbackRef, feedbackData);
      setFeedbackCache((prev) => ({ ...prev, [feedback._id]: feedback }));
    } catch (error) {
      console.error("Error creating feedback:", error);
      throw new Error("Unable to create feedback.");
    }
  };

  // Update feedback with error handling
  const updateFeedback = async (
    feedback_id: string,
    feedbackData: Partial<Feedback>,
  ) => {
    try {
      const feedbackRef = doc(db, "Feedbacks", feedback_id);
      await updateDoc(feedbackRef, feedbackData);
      setFeedbackCache((prev) => ({
        ...prev,
        [feedback_id]: { ...prev[feedback_id], ...feedbackData },
      }));
    } catch (error) {
      console.error("Error updating feedback:", error);
      throw new Error("Unable to update feedback.");
    }
  };

  // Delete feedback with error handling
  const deleteFeedback = async (feedback_id: string) => {
    try {
      const feedbackRef = doc(db, "Feedbacks", feedback_id);
      await deleteDoc(feedbackRef);
      setFeedbackCache((prev) => {
        const updatedCache = { ...prev };
        delete updatedCache[feedback_id];
        return updatedCache;
      });
    } catch (error) {
      console.error("Error deleting feedback:", error);
      throw new Error("Unable to delete feedback.");
    }
  };

  // Get feedback by ID with caching and error handling
  const getFeedback = async (feedback_id: string): Promise<Feedback | null> => {
    if (memoizedFeedbackCache[feedback_id])
      return memoizedFeedbackCache[feedback_id];

    try {
      const feedbackRef = doc(db, "Feedbacks", feedback_id);
      const feedbackDoc = await getDoc(feedbackRef);
      const feedbackData = feedbackDoc.exists()
        ? (feedbackDoc.data() as Feedback)
        : null;

      if (feedbackData)
        setFeedbackCache((prev) => ({ ...prev, [feedback_id]: feedbackData }));
      return feedbackData;
    } catch (error) {
      console.error("Error fetching feedback:", error);
      throw new Error("Unable to fetch feedback.");
    }
  };

  // Get all feedback with optional limit (pagination)
  const getAllFeedbacks = async (fetchLimit = 50): Promise<Feedback[]> => {
    try {
      const feedbackSnapshot = await getDocs(
        query(collection(db, "Feedbacks"), limit(fetchLimit)),
      );
      const feedbacks = feedbackSnapshot.docs.map(
        (doc) => doc.data() as Feedback,
      );
      setFeedbackCache((prev) =>
        feedbacks.reduce(
          (cache, feedback) => ({ ...cache, [feedback._id]: feedback }),
          prev,
        ),
      );
      return feedbacks;
    } catch (error) {
      console.error("Error fetching feedbacks:", error);
      throw new Error("Unable to fetch feedbacks.");
    }
  };

  // Filter feedbacks by multiple fields
  const filterFeedbacks = async (
    filters: Partial<Feedback>,
  ): Promise<Feedback[]> => {
    try {
      const feedbackRef = collection(db, "Feedbacks");
      let feedbackQuery = query(feedbackRef);

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          feedbackQuery = query(
            feedbackQuery,
            where(key as keyof Feedback, "==", value),
          );
        }
      });

      const filteredSnapshot = await getDocs(feedbackQuery);
      const feedbacks = filteredSnapshot.docs.map(
        (doc) => doc.data() as Feedback,
      );
      return feedbacks;
    } catch (error) {
      console.error("Error filtering feedbacks:", error);
      throw new Error("Unable to filter feedbacks.");
    }
  };

  // Subscribe to real-time feedback updates with caching
  const subscribeToFeedbackUpdates = (
    callback: (feedbacks: Feedback[]) => void,
  ) => {
    return onSnapshot(collection(db, "Feedbacks"), (snapshot) => {
      const feedbacks = snapshot.docs.map((doc) => doc.data() as Feedback);
      setFeedbackCache((prev) =>
        feedbacks.reduce(
          (cache, feedback) => ({ ...cache, [feedback._id]: feedback }),
          prev,
        ),
      );
      callback(feedbacks);
    });
  };

  useEffect(() => {
    const unsubscribe = subscribeToFeedbackUpdates((updatedFeedbacks) => {
      console.log("Feedbacks updated:", updatedFeedbacks);
    });

    return () => {
      unsubscribe(); // Cleanup on unmount
    };
  }, []);

  return (
    <FeedbackContext.Provider
      value={{
        createFeedback,
        updateFeedback,
        deleteFeedback,
        getFeedback,
        getAllFeedbacks,
        filterFeedbacks,
        subscribeToFeedbackUpdates,
        feedbackCache: memoizedFeedbackCache,
      }}
    >
      {children}
    </FeedbackContext.Provider>
  );
};

export const useFeedbackModel = () => {
  const context = useContext(FeedbackContext);

  if (!context)
    throw new Error("useFeedbackModel must be used within a FeedbackProvider");
  return context;
};
