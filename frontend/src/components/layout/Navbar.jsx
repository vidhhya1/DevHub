import { LogOut, Search, Terminal } from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { logoutUser } from "../../services/authService";
import { useAuth } from "../../context/useAuth";

export default function Navbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  async function handleLogout() {
    try {
      const refresh = localStorage.getItem("refresh");

      if (refresh) {
        await logoutUser(refresh);
      }
    } catch {
      // Even if blacklist request fails, local logout should still happen.
    }

    logout();
    toast.success("Logged out");
    navigate("/");
  }

  const initial = user?.username?.[0]?.toUpperCase() || "?";

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-[var(--color-line)] bg-[var(--color-surface)] px-5">
      <button
        onClick={() => navigate("/dashboard")}
        className="flex items-center gap-2 font-[var(--font-display)] text-lg font-bold text-[var(--color-ink)]"
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--color-ink)] text-[var(--color-accent)]">
          <Terminal size={15} strokeWidth={2.5} />
        </span>
        DevHub
      </button>

      <button
        onClick={() => navigate("/search")}
        className="hidden items-center gap-2 rounded-[var(--radius-md)] border border-[var(--color-line)] bg-[var(--color-canvas)] px-4 py-2 text-sm text-[var(--color-slate-txt)] transition-colors duration-150 hover:bg-[var(--color-line-soft)] md:flex"
      >
        <Search size={15} />
        Search DevHub
      </button>

      <div className="flex items-center gap-3">
        <div className="hidden items-center gap-2 sm:flex">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--color-accent-soft)] font-[var(--font-display)] text-xs font-semibold text-[var(--color-accent)]">
            {initial}
          </span>
          <span className="text-sm font-medium text-[var(--color-ink)]">
            {user?.username}
          </span>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 rounded-[var(--radius-md)] px-3 py-2 text-sm font-medium text-[var(--color-slate-txt)] transition-colors duration-150 hover:bg-[var(--color-signal-rose-soft)] hover:text-[var(--color-signal-rose)]"
        >
          <LogOut size={16} />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
}
