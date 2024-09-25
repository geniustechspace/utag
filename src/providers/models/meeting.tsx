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

export interface Meeting {
  meeting_id: string;
  title: string;
  agenda: string;
  date?: Date | any;
  time?: string;
  location?: string;
  minutes?: string;
  participants?: string[]; // Array of participant user IDs
}

interface MeetingModel {
  createMeeting: (meeting: Meeting) => Promise<void>;
  updateMeeting: (
    meeting_id: string,
    meetingData: Partial<Meeting>,
  ) => Promise<void>;
  deleteMeeting: (meeting_id: string) => Promise<void>;
  getMeeting: (meeting_id: string) => Promise<Meeting | null>;
  getAllMeetings: (fetchLimit?: number) => Promise<Meeting[]>;
  filterMeetings: (filters: Partial<Meeting>) => Promise<Meeting[]>;
  subscribeToMeetingUpdates: (
    callback: (meetings: Meeting[]) => void,
  ) => () => void;
  meetingCache: Record<string, Meeting>;
}

const MeetingContext = createContext<MeetingModel | null>(null);

export const MeetingProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [meetingCache, setMeetingCache] = useState<Record<string, Meeting>>({});

  const memoizedMeetingCache = useMemo(() => meetingCache, [meetingCache]);

  // Create a new meeting with error handling
  const createMeeting = async (meeting: Meeting) => {
    try {
      const meetingRef = doc(db, "meetings", meeting.meeting_id);
      const meetingData: Partial<Meeting> = { ...meeting };

      // Remove undefined fields
      Object.keys(meetingData).forEach((key) => {
        const typedKey = key as keyof Meeting;
        if (meetingData[typedKey] === undefined) {
          delete meetingData[typedKey];
        }
      });

      await setDoc(meetingRef, meetingData);
      setMeetingCache((prev) => ({ ...prev, [meeting.meeting_id]: meeting }));
    } catch (error) {
      console.error("Error creating meeting:", error);
      throw new Error("Unable to create meeting.");
    }
  };

  // Update a meeting with error handling
  const updateMeeting = async (
    meeting_id: string,
    meetingData: Partial<Meeting>,
  ) => {
    try {
      const meetingRef = doc(db, "meetings", meeting_id);
      await updateDoc(meetingRef, meetingData);
      setMeetingCache((prev) => ({
        ...prev,
        [meeting_id]: { ...prev[meeting_id], ...meetingData },
      }));
    } catch (error) {
      console.error("Error updating meeting:", error);
      throw new Error("Unable to update meeting.");
    }
  };

  // Delete a meeting by ID with error handling
  const deleteMeeting = async (meeting_id: string) => {
    try {
      const meetingRef = doc(db, "meetings", meeting_id);
      await deleteDoc(meetingRef);
      setMeetingCache((prev) => {
        const updatedCache = { ...prev };
        delete updatedCache[meeting_id];
        return updatedCache;
      });
    } catch (error) {
      console.error("Error deleting meeting:", error);
      throw new Error("Unable to delete meeting.");
    }
  };

  // Get a meeting by ID with caching and error handling
  const getMeeting = async (meeting_id: string): Promise<Meeting | null> => {
    if (memoizedMeetingCache[meeting_id])
      return memoizedMeetingCache[meeting_id];

    try {
      const meetingRef = doc(db, "meetings", meeting_id);
      const meetingDoc = await getDoc(meetingRef);
      const meetingData = meetingDoc.exists()
        ? (meetingDoc.data() as Meeting)
        : null;

      if (meetingData)
        setMeetingCache((prev) => ({ ...prev, [meeting_id]: meetingData }));
      return meetingData;
    } catch (error) {
      console.error("Error fetching meeting:", error);
      throw new Error("Unable to fetch meeting.");
    }
  };

  // Get all meetings with an optional limit (pagination)
  const getAllMeetings = async (fetchLimit = 50): Promise<Meeting[]> => {
    try {
      const meetingSnapshot = await getDocs(
        query(collection(db, "meetings"), limit(fetchLimit)),
      );
      const meetings = meetingSnapshot.docs.map((doc) => doc.data() as Meeting);
      setMeetingCache((prev) =>
        meetings.reduce(
          (cache, meeting) => ({ ...cache, [meeting.meeting_id]: meeting }),
          prev,
        ),
      );
      return meetings;
    } catch (error) {
      console.error("Error fetching meetings:", error);
      throw new Error("Unable to fetch meetings.");
    }
  };

  // Filter meetings by multiple fields
  const filterMeetings = async (
    filters: Partial<Meeting>,
  ): Promise<Meeting[]> => {
    try {
      const meetingRef = collection(db, "meetings");
      let meetingQuery = query(meetingRef);

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          meetingQuery = query(
            meetingQuery,
            where(key as keyof Meeting, "==", value),
          );
        }
      });

      const filteredSnapshot = await getDocs(meetingQuery);
      const meetings = filteredSnapshot.docs.map(
        (doc) => doc.data() as Meeting,
      );
      return meetings;
    } catch (error) {
      console.error("Error filtering meetings:", error);
      throw new Error("Unable to filter meetings.");
    }
  };

  // Subscribe to real-time meeting updates with caching
  const subscribeToMeetingUpdates = (
    callback: (meetings: Meeting[]) => void,
  ) => {
    return onSnapshot(collection(db, "meetings"), (snapshot) => {
      const meetings = snapshot.docs.map((doc) => doc.data() as Meeting);
      setMeetingCache((prev) =>
        meetings.reduce(
          (cache, meeting) => ({ ...cache, [meeting.meeting_id]: meeting }),
          prev,
        ),
      );
      callback(meetings);
    });
  };

  useEffect(() => {
    const unsubscribe = subscribeToMeetingUpdates((updatedMeetings) => {
      console.log("Meetings updated:", updatedMeetings);
    });

    // Prepopulate the cache on mount
    const fetchMeetings = async () => {
      try {
        await getAllMeetings();
      } catch (error) {
        console.error("Error during initial fetch:", error);
      }
    };

    fetchMeetings();

    return () => {
      unsubscribe(); // Cleanup on unmount
    };
  }, []);

  return (
    <MeetingContext.Provider
      value={{
        createMeeting,
        updateMeeting,
        deleteMeeting,
        getMeeting,
        getAllMeetings,
        filterMeetings,
        subscribeToMeetingUpdates,
        meetingCache: memoizedMeetingCache,
      }}
    >
      {children}
    </MeetingContext.Provider>
  );
};

export const useMeetingModel = () => {
  const context = useContext(MeetingContext);

  if (!context)
    throw new Error("useMeetingModel must be used within a MeetingProvider");
  return context;
};
