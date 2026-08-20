import { useState } from "react";
import {
  Search,
  FolderKanban,
  ListTodo,
  Code2,
  Tag as TagIcon,
} from "lucide-react";
import toast from "react-hot-toast";

import { globalSearch } from "../../services/searchService";

import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";

const SECTION_ICONS = {
  projects: FolderKanban,
  tasks: ListTodo,
  snippets: Code2,
  tags: TagIcon,
};

export default function SearchPage() {
  const [query, setQuery] = useState("");

  const [results, setResults] = useState({
    projects: [],
    tasks: [],
    snippets: [],
    tags: [],
  });

  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  async function handleSearch(event) {
    event.preventDefault();

    if (!query.trim()) {
      setResults({ projects: [], tasks: [], snippets: [], tags: [] });
      setSearched(false);
      return;
    }

    try {
      setLoading(true);

      const response = await globalSearch(query.trim());

      setResults(response.data);
      setSearched(true);
    } catch (error) {
      console.error(error);
      toast.error("Search failed");
    } finally {
      setLoading(false);
    }
  }

  const sections = [
    { key: "projects", title: "Projects" },
    { key: "tasks", title: "Tasks" },
    { key: "snippets", title: "Snippets" },
    { key: "tags", title: "Tags" },
  ];

  const totalResults =
    results.projects.length +
    results.tasks.length +
    results.snippets.length +
    results.tags.length;

  return (
    <div className="space-y-7">
      <div>
        <h1 className="font-[var(--font-display)] text-3xl font-bold text-[var(--color-ink)]">
          Search
        </h1>

        <p className="mt-1 text-[var(--color-slate-txt)]">
          Search across your DevHub workspace.
        </p>
      </div>

      <form
        onSubmit={handleSearch}
        className="flex gap-2 rounded-[var(--radius-lg)] border border-[var(--color-line)] bg-[var(--color-surface)] p-4 shadow-[var(--shadow-sm)]"
      >
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search projects, tasks, snippets..."
          className="flex-1 rounded-[var(--radius-md)] border border-[var(--color-line)] bg-[var(--color-surface)] px-4 py-2.5 text-sm text-[var(--color-ink)] outline-none transition-colors duration-150 placeholder:text-[var(--color-slate-faint)] focus:border-[var(--color-accent)]"
        />

        <Button type="submit" disabled={loading}>
          <span className="flex items-center gap-2">
            <Search size={16} />
            {loading ? "Searching..." : "Search"}
          </span>
        </Button>
      </form>

      {searched && !loading && (
        <p className="text-sm text-[var(--color-slate-txt)]">
          <span className="font-mono font-medium text-[var(--color-ink)]">
            {totalResults}
          </span>{" "}
          result{totalResults !== 1 ? "s" : ""} found
        </p>
      )}

      <div className="space-y-8">
        {sections.map(({ key, title }) => {
          const items = results[key] || [];
          const Icon = SECTION_ICONS[key];

          if (searched && items.length === 0) {
            return null;
          }

          if (!searched) {
            return null;
          }

          return (
            <section key={key}>
              <h2 className="mb-3 flex items-center gap-2 font-[var(--font-display)] text-lg font-semibold text-[var(--color-ink)]">
                <Icon size={17} className="text-[var(--color-accent)]" />
                {title}
                <Badge tone="neutral">{items.length}</Badge>
              </h2>

              <div className="grid gap-3 md:grid-cols-2">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-[var(--radius-lg)] border border-[var(--color-line)] bg-[var(--color-surface)] p-5 shadow-[var(--shadow-sm)] transition-shadow duration-150 hover:shadow-[var(--shadow-md)]"
                  >
                    <h3 className="font-semibold text-[var(--color-ink)]">
                      {item.title}
                    </h3>

                    {item.description && (
                      <p className="mt-2 line-clamp-2 text-sm text-[var(--color-slate-txt)]">
                        {item.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          );
        })}

        {searched && totalResults === 0 && (
          <div className="rounded-[var(--radius-lg)] border border-[var(--color-line)] bg-[var(--color-surface)] p-10 text-center">
            <p className="text-[var(--color-slate-txt)]">
              No results for "{query}".
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
