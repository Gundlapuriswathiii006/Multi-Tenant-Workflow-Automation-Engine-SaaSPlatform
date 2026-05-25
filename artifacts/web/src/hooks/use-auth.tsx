import { createContext, useContext, useEffect, useState } from "react";
import { useGetMe } from "@workspace/api-client-react";
import { useLocation } from "wouter";

type AuthContextType = {
  isAuthenticated: boolean;
  isLoading: boolean;
  logout: () => void;
  user: ReturnType<typeof useGetMe>["data"] | null;
};

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isLoading: true,
  logout: () => {},
  user: null,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [, setLocation] = useLocation();
  const token = typeof window !== "undefined" ? localStorage.getItem("flowforge_token") : null;
  
  const { data: user, isLoading: isUserLoading, error } = useGetMe({
    query: {
      enabled: !!token,
      retry: false,
    }
  });

  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    if (!isUserLoading) {
      setIsInitializing(false);
    }
  }, [isUserLoading]);

  const logout = () => {
    localStorage.removeItem("flowforge_token");
    setLocation("/login");
  };

  const isAuthenticated = !!user;
  const isLoading = isInitializing || isUserLoading;

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, logout, user: user ?? null }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
