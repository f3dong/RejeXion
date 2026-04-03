import { type ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth-context";
import { useLogout, getGetMeQueryKey, getListEntriesQueryKey, getGetStatsQueryKey, getGetPointsQueryKey, getGetProfileQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { user } = useAuth();
  const [location] = useLocation();
  const queryClient = useQueryClient();
  const logout = useLogout();

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
        queryClient.clear();
        window.location.href = "/";
      },
    });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/timeline">
            <span className="font-serif text-xl font-medium text-foreground tracking-tight hover:text-primary transition-colors cursor-pointer">
              RejeXion
            </span>
          </Link>
          <nav className="flex items-center gap-1">
            <Link href="/timeline">
              <span className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors cursor-pointer ${location === "/timeline" ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground hover:bg-secondary"}`}>
                Timeline
              </span>
            </Link>
            <Link href="/profile">
              <span className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors cursor-pointer ${location === "/profile" ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground hover:bg-secondary"}`}>
                {user?.name?.split(" ")[0] ?? "Profile"}
              </span>
            </Link>
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            >
              Sign out
            </button>
          </nav>
        </div>
      </header>
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-8">
        {children}
      </main>
    </div>
  );
}
