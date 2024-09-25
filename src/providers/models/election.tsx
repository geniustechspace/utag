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
  arrayUnion,
  arrayRemove,
  serverTimestamp,
} from "firebase/firestore";
import { useState, useEffect, useContext, createContext, useMemo } from "react";

export interface Vote {
  user_id: string;
  candidate_id: string;
  timestamp: Date | any;
}

export interface Election {
  election_id: string;
  position: string;
  candidates: string[]; // Array of candidate IDs
  voting_start_date: Date | any;
  voting_end_date: Date | any;
  results: Vote[]; // Array of Vote objects
}

interface ElectionModel {
  createElection: (election: Election) => Promise<void>;
  updateElection: (
    election_id: string,
    electionData: Partial<Election>,
  ) => Promise<void>;
  deleteElection: (election_id: string) => Promise<void>;
  getElection: (election_id: string) => Promise<Election | null>;
  getAllElections: (fetchLimit?: number) => Promise<Election[]>;
  voteInElection: (election_id: string, vote: Vote) => Promise<void>;
  filterElections: (filters: Partial<Election>) => Promise<Election[]>;
  subscribeToElectionUpdates: (
    callback: (elections: Election[]) => void,
  ) => () => void;
  electionCache: Record<string, Election>;
}

const ElectionContext = createContext<ElectionModel | null>(null);

export const ElectionProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [electionCache, setElectionCache] = useState<Record<string, Election>>(
    {},
  );

  const memoizedElectionCache = useMemo(() => electionCache, [electionCache]);

  // Create a new election
  const createElection = async (election: Election) => {
    try {
      const electionRef = doc(db, "elections", election.election_id);
      const electionData: Partial<Election> = { ...election };

      // Remove undefined fields
      Object.keys(electionData).forEach((key) => {
        const typedKey = key as keyof Election;
        if (electionData[typedKey] === undefined) {
          delete electionData[typedKey];
        }
      });

      await setDoc(electionRef, electionData);
      setElectionCache((prev) => ({
        ...prev,
        [election.election_id]: election,
      }));
    } catch (error) {
      console.error("Error creating election:", error);
      throw new Error("Unable to create election.");
    }
  };

  // Update an existing election
  const updateElection = async (
    election_id: string,
    electionData: Partial<Election>,
  ) => {
    try {
      const electionRef = doc(db, "elections", election_id);
      await updateDoc(electionRef, electionData);
      setElectionCache((prev) => ({
        ...prev,
        [election_id]: { ...prev[election_id], ...electionData },
      }));
    } catch (error) {
      console.error("Error updating election:", error);
      throw new Error("Unable to update election.");
    }
  };

  // Delete an election
  const deleteElection = async (election_id: string) => {
    try {
      const electionRef = doc(db, "elections", election_id);
      await deleteDoc(electionRef);
      setElectionCache((prev) => {
        const updatedCache = { ...prev };
        delete updatedCache[election_id];
        return updatedCache;
      });
    } catch (error) {
      console.error("Error deleting election:", error);
      throw new Error("Unable to delete election.");
    }
  };

  // Get a specific election
  const getElection = async (election_id: string): Promise<Election | null> => {
    if (memoizedElectionCache[election_id])
      return memoizedElectionCache[election_id];

    try {
      const electionRef = doc(db, "elections", election_id);
      const electionDoc = await getDoc(electionRef);
      const electionData = electionDoc.exists()
        ? (electionDoc.data() as Election)
        : null;

      if (electionData)
        setElectionCache((prev) => ({ ...prev, [election_id]: electionData }));
      return electionData;
    } catch (error) {
      console.error("Error fetching election:", error);
      throw new Error("Unable to fetch election.");
    }
  };

  // Get all elections with optional pagination
  const getAllElections = async (fetchLimit = 50): Promise<Election[]> => {
    try {
      const electionSnapshot = await getDocs(
        query(collection(db, "elections"), limit(fetchLimit)),
      );
      const elections = electionSnapshot.docs.map(
        (doc) => doc.data() as Election,
      );
      setElectionCache((prev) =>
        elections.reduce(
          (cache, election) => ({ ...cache, [election.election_id]: election }),
          prev,
        ),
      );
      return elections;
    } catch (error) {
      console.error("Error fetching elections:", error);
      throw new Error("Unable to fetch elections.");
    }
  };

  // Voting function with validation on vote date and overriding previous vote
  const voteInElection = async (election_id: string, vote: Vote) => {
    const election = await getElection(election_id);

    if (!election) {
      throw new Error("Election not found.");
    }

    const currentDate = new Date();
    const startDate = new Date(election.voting_start_date);
    const endDate = new Date(election.voting_end_date);

    // Check if voting is allowed within the date range
    if (currentDate < startDate || currentDate > endDate) {
      throw new Error("Voting is not allowed at this time.");
    }

    const electionRef = doc(db, "elections", election_id);

    // Check if the user has already voted, and override the vote if so
    const existingVote = election.results.find(
      (v) => v.user_id === vote.user_id,
    );

    if (existingVote) {
      await updateDoc(electionRef, {
        results: arrayRemove(existingVote),
      });
    }

    // Add the new vote
    await updateDoc(electionRef, {
      results: arrayUnion({
        ...vote,
        timestamp: serverTimestamp(),
      }),
    });

    setElectionCache((prev) => {
      const updatedResults = election.results.filter(
        (v) => v.user_id !== vote.user_id,
      );
      updatedResults.push({ ...vote, timestamp: new Date() });

      return {
        ...prev,
        [election_id]: { ...election, results: updatedResults },
      };
    });
  };

  // Filter elections by multiple fields
  const filterElections = async (
    filters: Partial<Election>,
  ): Promise<Election[]> => {
    try {
      const electionRef = collection(db, "elections");
      let electionQuery = query(electionRef);

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          electionQuery = query(
            electionQuery,
            where(key as keyof Election, "==", value),
          );
        }
      });

      const filteredSnapshot = await getDocs(electionQuery);
      const elections = filteredSnapshot.docs.map(
        (doc) => doc.data() as Election,
      );
      return elections;
    } catch (error) {
      console.error("Error filtering elections:", error);
      throw new Error("Unable to filter elections.");
    }
  };

  // Subscribe to real-time election updates
  const subscribeToElectionUpdates = (
    callback: (elections: Election[]) => void,
  ) => {
    return onSnapshot(collection(db, "elections"), (snapshot) => {
      const elections = snapshot.docs.map((doc) => doc.data() as Election);
      setElectionCache((prev) =>
        elections.reduce(
          (cache, election) => ({ ...cache, [election.election_id]: election }),
          prev,
        ),
      );
      callback(elections);
    });
  };

  useEffect(() => {
    const unsubscribe = subscribeToElectionUpdates((updatedElections) => {
      console.log("Elections updated:", updatedElections);
    });

    // Prepopulate the cache on mount
    const fetchElections = async () => {
      try {
        await getAllElections();
      } catch (error) {
        console.error("Error during initial feedback fetch:", error);
      }
    };

    fetchElections();

    return () => {
      unsubscribe(); // Cleanup on unmount
    };
  }, []);

  return (
    <ElectionContext.Provider
      value={{
        createElection,
        updateElection,
        deleteElection,
        getElection,
        getAllElections,
        voteInElection,
        filterElections,
        subscribeToElectionUpdates,
        electionCache: memoizedElectionCache,
      }}
    >
      {children}
    </ElectionContext.Provider>
  );
};

export const useElectionModel = () => {
  const context = useContext(ElectionContext);

  if (!context)
    throw new Error("useElectionModel must be used within an ElectionProvider");
  return context;
};
