"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { onAuthStateChanged, User as AuthUser } from "firebase/auth";

import { internalUrls } from "@/config/site-config";
import { auth } from "@/config/firebase-config";
import { ElevatedLoading } from "@/components/loading";
import { User, useUserModel } from "@/providers/models/user-profile";

interface AuthContextType {
  authUser: AuthUser | null;
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [authUser, seAuthUser] = useState<AuthUser | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { getUser } = useUserModel();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (_user) => {
      if (_user) {
        seAuthUser(_user);
        const user = await getUser(_user.uid);

        setUser(user);
      } else {
        seAuthUser(null);
        setUser(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ authUser, user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};

export const useLoginRequired = (): void => {
  const { authUser, loading } = useAuth();
  const router = useRouter();
  const currentRoute = usePathname();

  useEffect(() => {
    if (!loading && !authUser && !currentRoute.startsWith(internalUrls.auth)) {
      router.replace(`${internalUrls.signin}?redirect=${currentRoute}`);
    }
  }, [loading, authUser, router, currentRoute]);
};

export const withLoginRequired = <P extends object>(
  Component: React.ComponentType<P>,
) => {
  const WrappedComponent = (props: P) => {
    useLoginRequired();
    const { authUser, loading } = useAuth();

    // if (loading || !authUser) {
    //   return <ElevatedLoading />;
    // }

    return <Component {...props} />;
  };

  WrappedComponent.displayName = `withLoginRequired(${Component.displayName || Component.name || "Component"})`;

  return WrappedComponent;
};
