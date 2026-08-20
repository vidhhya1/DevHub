import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  Users,
  Code2,
  History,
  MessageSquare,
  ListTodo,
  Circle,
  Loader2,
  Eye,
  CheckCircle2,
} from "lucide-react";

import { getProjectDashboard } from "../../services/dashboardService";
import { getProjects } from "../../services/projectService";

import StatCard from "../../components/ui/StatCard";
import Button from "../../components/ui/Button";

export default function DashboardPage() {
  const [projects, setProjects] = useState([]);

  const [projectId, setProjectId] = useState(
    () => localStorage.getItem("selectedProjectId") || ""
  );

  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dashboardError, setDashboardError] = useState(false);

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
          setDashboard(null);
          setLoading(false);
          return;
        }

        const savedId =
          localStorage.getItem("selectedProjectId");

        const savedProjectExists = data.some(
          (project) =>
            String(project.id) === String(savedId)
        );

        if (savedProjectExists) {
          setProjectId(String(savedId));
        } else {
          const firstId = String(data[0].id);

          setProjectId(firstId);

          localStorage.setItem(
            "selectedProjectId",
            firstId
          );
        }
      } catch (error) {
        if (cancelled) {
          return;
        }

        console.error(
          "Unable to load projects:",
          error
        );

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
   * Load dashboard whenever the selected project changes.
   */
  useEffect(() => {
    if (!projectId) {
      return;
    }

    let cancelled = false;

    async function fetchDashboard() {
      try {
        setLoading(true);
        setDashboardError(false);

        const response =
          await getProjectDashboard(projectId);

        if (cancelled) {
          return;
        }

        setDashboard(response.data);
      } catch (error) {
        if (cancelled) {
          return;
        }

        console.error(
          "Dashboard error:",
          error
        );

        setDashboard(null);
        setDashboardError(true);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchDashboard();

    return () => {
      cancelled = true;
    };
  }, [projectId]);

  /*
   * Change selected project.
   */
  function handleProjectChange(event) {
    const id = event.target.value;

    setProjectId(id);
    setDashboard(null);

    localStorage.setItem(
      "selectedProjectId",
      id
    );
  }

  /*
   * Retry dashboard request.
   */
  async function handleRetry() {
    if (!projectId) {
      return;
    }

    try {
      setLoading(true);
      setDashboardError(false);

      const response =
        await getProjectDashboard(projectId);

      setDashboard(response.data);
    } catch (error) {
      console.error(
        "Dashboard retry error:",
        error
      );

      setDashboard(null);
      setDashboardError(true);

      toast.error(
        "Unable to load dashboard"
      );
    } finally {
      setLoading(false);
    }
  }

  /*
   * Loading state.
   */
  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center gap-2 text-[var(--color-slate-txt)]">
        <Loader2 size={16} className="animate-spin" />
        Loading dashboard...
      </div>
    );
  }

  /*
   * No projects.
   */
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

  /*
   * Dashboard could not be loaded.
   */
  if (dashboardError || !dashboard) {
    return (
      <div className="rounded-[var(--radius-lg)] border border-[var(--color-line)] bg-[var(--color-surface)] p-10 text-center shadow-[var(--shadow-sm)]">
        <h1 className="text-xl font-semibold text-[var(--color-ink)]">
          Unable to load dashboard
        </h1>

        <p className="mt-2 text-sm text-[var(--color-slate-txt)]">
          Select a project you are a member of.
        </p>

        <div className="mt-5 flex justify-center gap-2">
          <select
            value={projectId}
            onChange={handleProjectChange}
            className="rounded-[var(--radius-md)] border border-[var(--color-line)] bg-[var(--color-surface)] px-4 py-2 text-sm outline-none focus:border-[var(--color-accent)]"
          >
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>

          <Button type="button" onClick={handleRetry}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const tasks = dashboard.tasks || {};

  /*
   * Dashboard UI.
   */
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="font-[var(--font-display)] text-3xl font-bold text-[var(--color-ink)]">
            {dashboard.project_name}
          </h1>

          <p className="mt-1 text-[var(--color-slate-txt)]">
            Project overview and development statistics
          </p>
        </div>

        <select
          value={projectId}
          onChange={handleProjectChange}
          className="rounded-[var(--radius-md)] border border-[var(--color-line)] bg-[var(--color-surface)] px-4 py-2.5 text-sm shadow-[var(--shadow-xs)] outline-none focus:border-[var(--color-accent)]"
        >
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </select>
      </div>

      {/* Project statistics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Members"
          value={dashboard.members ?? 0}
          icon={Users}
          tone="accent"
        />

        <StatCard
          title="Snippets"
          value={dashboard.snippets ?? 0}
          icon={Code2}
          tone="neutral"
        />

        <StatCard
          title="Versions"
          value={dashboard.versions ?? 0}
          icon={History}
          tone="neutral"
        />

        <StatCard
          title="Reviews"
          value={dashboard.reviews ?? 0}
          icon={MessageSquare}
          tone="neutral"
        />
      </div>

      {/* Task statistics */}
      <section>
        <h2 className="mb-4 font-[var(--font-display)] text-lg font-semibold text-[var(--color-ink)]">
          Task overview
        </h2>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <StatCard
            title="Total tasks"
            value={tasks.total ?? 0}
            icon={ListTodo}
            tone="accent"
          />

          <StatCard
            title="To do"
            value={tasks.todo ?? 0}
            icon={Circle}
            tone="neutral"
          />

          <StatCard
            title="In progress"
            value={tasks.in_progress ?? 0}
            icon={Loader2}
            tone="amber"
          />

          <StatCard
            title="In review"
            value={tasks.in_review ?? 0}
            icon={Eye}
            tone="amber"
          />

          <StatCard
            title="Completed"
            value={tasks.done ?? 0}
            icon={CheckCircle2}
            tone="green"
          />
        </div>
      </section>
    </div>
  );
}