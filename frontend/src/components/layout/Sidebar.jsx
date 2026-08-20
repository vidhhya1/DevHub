import {
  BarChart3,
  FolderKanban,
  ListTodo,
  MessageSquare,
  Code2,
  Search,
  Activity,
} from "lucide-react";

import { NavLink } from "react-router-dom";

const links = [
  { path: "/dashboard", label: "Dashboard", icon: BarChart3 },
  { path: "/projects", label: "Projects", icon: FolderKanban },
  { path: "/tasks", label: "Tasks", icon: ListTodo },
  { path: "/reviews", label: "Reviews", icon: MessageSquare },
  { path: "/snippets", label: "Snippets", icon: Code2 },
  { path: "/search", label: "Search", icon: Search },
  { path: "/activities", label: "Activity", icon: Activity },
];

export default function Sidebar() {
  return (
    <aside className="hidden min-h-[calc(100vh-4rem)] w-60 shrink-0 bg-[var(--color-ink)] md:block">
      <nav className="space-y-0.5 p-3">
        {links.map(({ path, label, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              "flex items-center gap-3 rounded-[var(--radius-md)] px-3 py-2.5 text-sm font-medium transition-colors duration-150 " +
              (isActive
                ? "bg-[var(--color-accent)] text-white"
                : "text-[#9199a8] hover:bg-[var(--color-ink-soft)] hover:text-white")
            }
          >
            <Icon size={17} strokeWidth={2} />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
