"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { User, onAuthStateChanged } from "firebase/auth";
import { Modal, ModalContent } from "@nextui-org/modal";
import { Spinner } from "@nextui-org/spinner";

import { internalUrls } from "@/config/site-config";
import { auth } from "@/config/firebase-config";

interface AuthContextType {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
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

export const useLoginRequired = (): AuthContextType => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const currentRoute = usePathname();

  if (!loading && !user && !currentRoute.startsWith(internalUrls.auth)) {
    router.replace(`${internalUrls.login}?redirect=${currentRoute}`); // Redirect to login page if not authenticated
  }

  return { user, loading };
};

export const withLoginRequired = (Component: React.ComponentType) => {
  const AuthenticatedComponent = (props: any) => {
    const { user, loading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
      if (!loading && !user) {
        router.push(`${internalUrls.login}?redirect=${pathname}`);
      }
    }, [user, loading, pathname, router]);

    if (loading || !user) {
      return (
        <Modal
          backdrop="opaque"
          defaultOpen={true}
          hideCloseButton={true}
          isDismissable={false}
          placement="center"
        >
          <ModalContent className="flex max-w-[12em] justify-center p-5 align-middle">
            <Spinner classNames={{ wrapper: "pt-2" }} />
            <h3 className="mt-3 text-center font-semibold">Loading ...</h3>
          </ModalContent>
        </Modal>
      );
    }

    return <Component {...props} />;
  };

  return AuthenticatedComponent;
};
