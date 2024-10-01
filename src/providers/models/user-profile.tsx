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

export interface User {
  photoURL?: string;
  user_id: string;
  name: string;
  email: string;
  password?: string;
  contact?: string;
  address?: string;
  role:
    | "Member"
    | "Secretary"
    | "President"
    | "Treasurer"
    | "Vice President"
    | "Electoral Commissioner";
  institution?: string;
  department?: string;
  dateJoined?: Date | any;
  slug?: string;
}

interface UserModel {
  createUser: (user: User) => Promise<void>;
  updateUser: (user_id: string, userData: Partial<User>) => Promise<void>;
  deleteUser: (user_id: string) => Promise<void>;
  getUser: (user_id: string) => Promise<User | null>;
  getAllUsers: (limit?: number) => Promise<User[]>;
  filterUsers: (filters: Partial<User>) => Promise<User[]>;
  subscribeToUserUpdates: (callback: (users: User[]) => void) => () => void;
  userCache: Record<string, User>;
}

const UserContext = createContext<UserModel | null>(null);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [userCache, setUserCache] = useState<Record<string, User>>({});

  // Memoize the user cache to prevent unnecessary re-renders
  const memoizedUserCache = useMemo(() => userCache, [userCache]);

  // Create user with error handling
  const createUser = async (user: User) => {
    const _user = await getUser(user.user_id);

    if (_user) return;
    try {
      user.slug = user.name.split(" ").join("-");
      user.dateJoined = new Date();
      const userRef = doc(db, "Users", user.user_id);
      const userData: Partial<User> = { ...user };

      // Remove undefined fields
      Object.keys(userData).forEach((key) => {
        const typedKey = key as keyof User;

        if (userData[typedKey] === undefined) {
          delete userData[typedKey];
        }
      });

      await setDoc(userRef, userData);
      setUserCache((prev) => ({ ...prev, [user.user_id]: user }));
    } catch (error) {
      console.error("Error creating user:", error);
      throw new Error("Unable to create user.");
    }
  };

  // Update user with error handling
  const updateUser = async (user_id: string, userData: Partial<User>) => {
    try {
      const userRef = doc(db, "Users", user_id);

      await updateDoc(userRef, userData);
      setUserCache((prev) => ({
        ...prev,
        [user_id]: { ...prev[user_id], ...userData },
      }));
    } catch (error) {
      console.error("Error updating user:", error);
      throw new Error("Unable to update user.");
    }
  };

  // Delete user with error handling
  const deleteUser = async (user_id: string) => {
    try {
      const userRef = doc(db, "Users", user_id);

      await deleteDoc(userRef);
      setUserCache((prev) => {
        const updatedCache = { ...prev };

        delete updatedCache[user_id];

        return updatedCache;
      });
    } catch (error) {
      console.error("Error deleting user:", error);
      throw new Error("Unable to delete user.");
    }
  };

  // Get user by ID with caching and error handling
  const getUser = async (user_id: string): Promise<User | null> => {
    if (memoizedUserCache[user_id]) return memoizedUserCache[user_id];

    try {
      const userRef = doc(db, "Users", user_id);
      const userDoc = await getDoc(userRef);
      const userData = userDoc.exists() ? (userDoc.data() as User) : null;

      if (userData) setUserCache((prev) => ({ ...prev, [user_id]: userData }));

      return userData;
    } catch (error) {
      console.error("Error fetching user:", error);
      throw new Error("Unable to fetch user.");
    }
  };

  // Get all users with optional limit (pagination)
  const getAllUsers = async (fetchLimit = 50): Promise<User[]> => {
    try {
      const usersSnapshot = await getDocs(
        query(collection(db, "Users"), limit(fetchLimit)),
      );
      const users = usersSnapshot.docs.map((doc) => doc.data() as User);

      setUserCache((prev) =>
        users.reduce(
          (cache, user) => ({ ...cache, [user.user_id]: user }),
          prev,
        ),
      );

      return users;
    } catch (error) {
      console.error("Error fetching users:", error);
      throw new Error("Unable to fetch users.");
    }
  };

  // Filter users by multiple fields
  const filterUsers = async (filters: Partial<User>): Promise<User[]> => {
    try {
      const userRef = collection(db, "Users");
      let userQuery = query(userRef);

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          userQuery = query(userQuery, where(key as keyof User, "==", value));
        }
      });

      const filteredSnapshot = await getDocs(userQuery);
      const users = filteredSnapshot.docs.map((doc) => doc.data() as User);

      return users;
    } catch (error) {
      console.error("Error filtering users:", error);
      throw new Error("Unable to filter users.");
    }
  };

  // Subscribe to real-time user updates with debouncing
  const subscribeToUserUpdates = (callback: (users: User[]) => void) => {
    return onSnapshot(collection(db, "Users"), (snapshot) => {
      const users = snapshot.docs.map((doc) => doc.data() as User);

      setUserCache((prev) =>
        users.reduce(
          (cache, user) => ({ ...cache, [user.user_id]: user }),
          prev,
        ),
      );
      callback(users);
    });
  };

  useEffect(() => {
    const unsubscribe = subscribeToUserUpdates((updatedUsers) => {
      console.log("Users updated:", updatedUsers);
    });

    // Prepopulate the cache on mount
    const fetchUsers = async () => {
      try {
        await getAllUsers();
      } catch (error) {
        console.error("Error during initial fetch:", error);
      }
    };

    fetchUsers();

    return () => {
      unsubscribe(); // Cleanup on unmount
    };
  }, []);

  return (
    <UserContext.Provider
      value={{
        createUser,
        updateUser,
        deleteUser,
        getUser,
        getAllUsers,
        filterUsers,
        subscribeToUserUpdates,
        userCache: memoizedUserCache,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUserModel = () => {
  const context = useContext(UserContext);

  if (!context)
    throw new Error("useUserModel must be used within a UserProvider");

  return context;
};
