import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";

import { getVersions } from "../../services/versionService";
import Badge from "../../components/ui/Badge";

export default function VersionsPage() {
  const { snippetId } = useParams();

  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadVersions() {
      try {
        const response = await getVersions(snippetId);

        const data = Array.isArray(response.data)
          ? response.data
          : response.data.results || [];

        setVersions(data);
      } catch (error) {
        console.error(error);
        toast.error("Unable to load versions");
      } finally {
        setLoading(false);
      }
    }

    loadVersions();
  }, [snippetId]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 p-5 text-[var(--color-slate-txt)]">
        <Loader2 size={16} className="animate-spin" />
        Loading versions...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-[var(--font-display)] text-3xl font-bold text-[var(--color-ink)]">
          Version history
        </h1>

        <p className="mt-1 text-[var(--color-slate-txt)]">
          All saved versions of this snippet.
        </p>
      </div>

      {versions.length === 0 ? (
        <div className="rounded-[var(--radius-lg)] border border-[var(--color-line)] bg-[var(--color-surface)] p-8 text-center">
          <p className="text-[var(--color-slate-txt)]">
            No versions found.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {versions.map((version) => (
            <article
              key={version.id}
              className="rounded-[var(--radius-lg)] border border-[var(--color-line)] bg-[var(--color-surface)] p-5 shadow-[var(--shadow-sm)]"
            >
              <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-start">
                <div className="flex items-start gap-3">
                  <Badge tone="accent">
                    v{version.version_number}
                  </Badge>

                  <div>
                    <h2 className="font-[var(--font-display)] text-lg font-semibold text-[var(--color-ink)]">
                      {version.message}
                    </h2>
                  </div>
                </div>

                <div className="text-sm text-[var(--color-slate-txt)]">
                  By{" "}
                  <span className="font-medium text-[var(--color-ink)]">
                    {version.author?.username}
                  </span>
                </div>
              </div>

              <div className="mt-3 font-mono text-xs text-[var(--color-slate-faint)]">
                {version.created_at &&
                  new Date(version.created_at).toLocaleString()}
              </div>

              <pre className="mt-4 max-h-[500px] overflow-auto rounded-[var(--radius-md)] bg-[var(--color-ink)] p-5 font-mono text-sm text-slate-100">
                <code>{version.code}</code>
              </pre>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
