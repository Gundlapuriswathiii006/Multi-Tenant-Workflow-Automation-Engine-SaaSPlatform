import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { useEffect } from "react";

export function ProtectedRoute({ children, requireRole }: { children: React.ReactNode, requireRole?: "SUPER_ADMIN" | "ORG_ADMIN" | "USER" }) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setLocation("/login");
    }
  }, [isLoading, isAuthenticated, setLocation]);

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  if (requireRole && user) {
    const roles = ["USER", "ORG_ADMIN", "SUPER_ADMIN"];
    const userRoleIdx = roles.indexOf(user.role);
    const requireRoleIdx = roles.indexOf(requireRole);
    if (userRoleIdx < requireRoleIdx) {
      return (
        <div className="flex h-screen w-full flex-col items-center justify-center bg-background">
          <h2 className="text-xl font-bold text-foreground">Access Denied</h2>
          <p className="text-muted-foreground mt-2">You do not have permission to view this page.</p>
        </div>
      );
    }
  }

  return <>{children}</>;
}
