import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { 
  LayoutDashboard, 
  Workflow, 
  Activity, 
  Users, 
  Settings, 
  LogOut,
  Building2,
  Menu
} from "lucide-react";
import { Button } from "./ui/button";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { useState } from "react";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const navItems = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Workflows", href: "/workflows", icon: Workflow },
    { label: "Executions", href: "/executions", icon: Activity },
  ];

  if (user?.role === "ORG_ADMIN" || user?.role === "SUPER_ADMIN") {
    navItems.push({ label: "Users", href: "/users", icon: Users });
    navItems.push({ label: "Settings", href: "/settings", icon: Settings });
  }

  if (user?.role === "SUPER_ADMIN") {
    navItems.push({ label: "Tenants", href: "/tenants", icon: Building2 });
  }

  const NavLinks = () => (
    <>
      {navItems.map((item) => {
        const isActive = location.startsWith(item.href);
        return (
          <Link key={item.href} href={item.href} onClick={() => setIsMobileOpen(false)}>
            <div
              className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors cursor-pointer ${
                isActive 
                  ? "bg-primary text-primary-foreground font-medium" 
                  : "text-sidebar-foreground hover:bg-sidebar-accent"
              }`}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </div>
          </Link>
        );
      })}
    </>
  );

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-col border-r border-border bg-sidebar px-4 py-6">
        <div className="flex items-center gap-2 px-2 mb-8">
          <div className="h-8 w-8 rounded bg-primary flex items-center justify-center text-primary-foreground font-bold text-lg">
            F
          </div>
          <span className="text-xl font-bold text-sidebar-foreground tracking-tight">FlowForge</span>
        </div>
        
        <nav className="flex-1 space-y-1">
          <NavLinks />
        </nav>

        <div className="pt-4 border-t border-border mt-auto">
          <div className="px-3 mb-4">
            <p className="text-sm font-medium text-sidebar-foreground">{user?.name}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
          </div>
          <Button variant="ghost" className="w-full justify-start text-muted-foreground" onClick={logout}>
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Mobile Sidebar & Header */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <header className="md:hidden flex items-center justify-between px-4 h-16 border-b border-border bg-background">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded bg-primary flex items-center justify-center text-primary-foreground font-bold text-lg">
              F
            </div>
            <span className="text-xl font-bold text-foreground tracking-tight">FlowForge</span>
          </div>
          <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 bg-sidebar p-6 flex flex-col">
              <nav className="space-y-1 mt-8 flex-1">
                <NavLinks />
              </nav>
              <div className="pt-4 border-t border-border mt-auto">
                <Button variant="ghost" className="w-full justify-start text-muted-foreground" onClick={logout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto bg-background">
          {children}
        </main>
      </div>
    </div>
  );
}
