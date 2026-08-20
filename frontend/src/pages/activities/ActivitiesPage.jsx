import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";

import { getActivities } from "../../services/activityService";
import { getProjects } from "../../services/projectService";

const ACTION_LABELS = {
  CREATED: "created task",
  UPDATED: "updated task",
  DELETED: "deleted task",
  ASSIGNED: "assigned task",
  STATUS_CHANGED: "changed status of task",
  PRIORITY_CHANGED: "changed priority of task",
  REVIEW_CREATED: "created a review on task",
  REVIEW_UPDATED: "updated a review on task",
  REVIEW_DELETED: "deleted a review on task",
  SNIPPET_CREATED: "created snippet",
  SNIPPET_UPDATED: "updated snippet",
  SNIPPET_DELETED: "deleted snippet",
  VERSION_CREATED: "added a new version to snippet",
};

function formatTimestamp(value) {
  if (!value) {
    return "";
  }

  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
}

export default function ActivitiesPage() {
  const [projects, setProjects] = useState([]);

  const [projectId, setProjectId] = useState(
    () => localStorage.getItem("selectedProjectId") || ""
  );

  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activitiesError, setActivitiesError] = useState(false);

  /*
   * Load projects when the page opens.
   */
  useEffect(() => {
    let cancelled = false;

    async function fetchProjects() {
      try {
        const response = await getProjects();

        const data = Array.isArray(response.data)
          ? response.data
          : response.data?.results || [];

        if (cancelled) {
          return;
        }

        setProjects(data);

        if (!data.length) {
          setProjectId("");
          setLoading(false);
          return;
        }

        const savedId = localStorage.getItem("selectedProjectId");

        const savedProjectExists = data.some(
          (project) => String(project.id) === String(savedId)
        );

        if (savedProjectExists) {
          setProjectId(String(savedId));
        } else {
          const firstId = String(data[0].id);

          setProjectId(firstId);
          localStorage.setItem("selectedProjectId", firstId);
        }
      } catch (error) {
        if (cancelled) {
          return;
        }

        console.error("Unable to load projects:", error);
        toast.error("Unable to load projects");
        setLoading(false);
      }
    }

    fetchProjects();

    return () => {
      cancelled = true;
    };
  }, []);

  /*
   * Load activities whenever the selected project changes.
   */
  useEffect(() => {
    if (!projectId) {
      return;
    }

    let cancelled = false;

    async function fetchActivities() {
      try {
        setLoading(true);
        setActivitiesError(false);

        const response = await getActivities(projectId);

        if (cancelled) {
          return;
        }

        const data = Array.isArray(response.data)
          ? response.data
          : response.data?.results || [];

        setActivities(data);
      } catch (error) {
        if (cancelled) {
          return;
        }

        console.error("Activities error:", error);
        setActivities([]);
        setActivitiesError(true);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchActivities();

    return () => {
      cancelled = true;
    };
  }, [projectId]);

  function handleProjectChange(event) {
    const id = event.target.value;

    setProjectId(id);
    setActivities([]);

    localStorage.setItem("selectedProjectId", id);
  }

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center gap-2 text-[var(--color-slate-txt)]">
        <Loader2 size={16} className="animate-spin" />
        Loading activity...
      </div>
    );
  }

  if (!projects.length) {
    return (
      <div className="rounded-[var(--radius-lg)] border border-[var(--color-line)] bg-[var(--color-surface)] p-10 text-center shadow-[var(--shadow-sm)]">
        <h1 className="font-[var(--font-display)] text-2xl font-bold text-[var(--color-ink)]">
          No projects yet
        </h1>

        <p className="mt-2 text-[var(--color-slate-txt)]">
          Create a project to start using DevHub.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-[var(--font-display)] text-3xl font-bold text-[var(--color-ink)]">
            Activity
          </h1>

          <p className="mt-1 text-[var(--color-slate-txt)]">
            Recent activity for the selected project.
          </p>
        </div>

        <select
          value={projectId}
          onChange={handleProjectChange}
          className="rounded-[var(--radius-md)] border border-[var(--color-line)] bg-[var(--color-surface)] px-4 py-2 text-sm shadow-[var(--shadow-xs)] outline-none focus:border-[var(--color-accent)]"
        >
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </select>
      </div>

      {activitiesError ? (
        <div className="rounded-[var(--radius-lg)] border border-[var(--color-line)] bg-[var(--color-surface)] p-10 text-center shadow-[var(--shadow-sm)]">
          <h2 className="text-lg font-semibold text-[var(--color-ink)]">
            Unable to load activity
          </h2>

          <p className="mt-2 text-sm text-[var(--color-slate-txt)]">
            Select a project you are a member of.
          </p>
        </div>
      ) : activities.length === 0 ? (
        <div className="rounded-[var(--radius-lg)] border border-[var(--color-line)] bg-[var(--color-surface)] p-10 text-center shadow-[var(--shadow-sm)]">
          <h2 className="text-lg font-semibold text-[var(--color-ink)]">
            No activity yet
          </h2>

          <p className="mt-2 text-sm text-[var(--color-slate-txt)]">
            Actions on this project's tasks, reviews and snippets will
            show up here.
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-[var(--color-line)] rounded-[var(--radius-lg)] border border-[var(--color-line)] bg-[var(--color-surface)] shadow-[var(--shadow-sm)]">
          {activities.map((activity) => (
            <li key={activity.id} className="flex gap-3 p-4">
              <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-accent)]" />

              <div className="min-w-0 flex-1">
                <p className="text-sm text-[var(--color-ink)]">
                  <span className="font-medium">{activity.user}</span>{" "}
                  <span className="text-[var(--color-slate-txt)]">
                    {ACTION_LABELS[activity.action] ||
                      activity.action?.toLowerCase().replaceAll("_", " ")}
                  </span>
                  {activity.task && (
                    <>
                      {" "}
                      <span className="font-medium">{activity.task}</span>
                    </>
                  )}
                </p>

                {activity.description && (
                  <p className="mt-0.5 truncate text-sm text-[var(--color-slate-txt)]">
                    {activity.description}
                  </p>
                )}

                <p className="mt-1 font-mono text-xs text-[var(--color-slate-faint)]">
                  {formatTimestamp(activity.created_at)}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
