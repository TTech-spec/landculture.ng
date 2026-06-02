import { Link, useRouterState } from "@tanstack/react-router";
import { BarChart2, LayoutGrid } from "lucide-react";
import { useUser } from "@/lib/user-state";

export function TopNav() {
  const user = useUser();
  const { location } = useRouterState();
  const path = location.pathname;

  return (
    <header className="sticky top-0 z-30 border-b border-[#C7E6DB] bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <Link to="/" className="flex items-center gap-2">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[#004C3F] text-white text-sm font-bold">
            SP
          </span>
          <span className="hidden font-semibold text-[#004C3F] sm:inline">Sales Path</span>
        </Link>

        <nav className="flex items-center gap-1">
          <Link
            to="/"
            className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              path === "/"
                ? "bg-[#E2F3ED] text-[#004C3F]"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <LayoutGrid className="h-4 w-4" />
            <span className="hidden sm:inline">Dashboard</span>
          </Link>
          <Link
            to="/analytics"
            className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              path === "/analytics"
                ? "bg-[#E2F3ED] text-[#004C3F]"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <BarChart2 className="h-4 w-4" />
            <span className="hidden sm:inline">Analytics</span>
          </Link>
        </nav>

        <Link
          to="/profile"
          className="flex items-center gap-2 rounded-full text-sm hover:opacity-80"
        >
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#004C3F] text-xs font-semibold text-white">
            {user.initials}
          </span>
          <span className="hidden font-medium text-foreground sm:inline">{user.name}</span>
        </Link>
      </div>
    </header>
  );
}
