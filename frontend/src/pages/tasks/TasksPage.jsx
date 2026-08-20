import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";

import {
  createTask,
  deleteTask,
  getTasks,
  updateTask,
} from "../../services/taskService";

import { getMembers } from "../../services/projectService";

import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";

const initialForm = {
  title: "",
  description: "",
  status: "TODO",
  priority: "MEDIUM",
  due_date: "",
  assigned_to_id: "",
};

const STATUS_TONE = {
  TODO: "neutral",
  IN_PROGRESS: "amber",
  IN_REVIEW: "blue",
  DONE: "green",
};

const PRIORITY_TONE = {
  LOW: "neutral",
  MEDIUM: "blue",
  HIGH: "amber",
  URGENT: "rose",
};

const fieldClass =
  "w-full rounded-[var(--radius-md)] border border-[var(--color-line)] " +
  "bg-[var(--color-surface)] px-3.5 py-2.5 text-sm text-[var(--color-ink)] " +
  "outline-none transition-colors duration-150 placeholder:text-[var(--color-slate-faint)] " +
  "focus:border-[var(--color-accent)]";

const labelClass = "mb-1.5 block text-sm font-medium text-[var(--color-ink)]";

export default function TasksPage() {
  const projectId = localStorage.getItem("selectedProjectId");

  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadTasks = useCallback(async () => {
    if (!projectId) {
      return;
    }

    const response = await getTasks(projectId);

    const data = Array.isArray(response.data)
      ? response.data
      : response.data?.results || [];

    setTasks(data);
  }, [projectId]);

  const loadMembers = useCallback(async () => {
    if (!projectId) {
      return;
    }

    const response = await getMembers(projectId);

    const data = Array.isArray(response.data)
      ? response.data
      : response.data?.results || [];

    setMembers(data);
  }, [projectId]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!projectId) {
        setLoading(false);
        return;
      }

      Promise.all([loadTasks(), loadMembers()])
        .catch((error) => {
          console.error("Unable to load tasks:", error);
          toast.error("Unable to load tasks");
        })
        .finally(() => {
          setLoading(false);
        });
    }, 0);

    return () => {
      clearTimeout(timer);
    };
  }, [projectId, loadTasks, loadMembers]);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!projectId) {
      toast.error("Select a project first");
      return;
    }

    if (!form.title.trim()) {
      toast.error("Task title is required");
      return;
    }

    try {
      const payload = {
        ...form,
        title: form.title.trim(),
        description: form.description.trim(),
        assigned_to_id: form.assigned_to_id
          ? Number(form.assigned_to_id)
          : null,
      };

      if (editingId) {
        await updateTask(projectId, editingId, payload);
        toast.success("Task updated");
      } else {
        await createTask(projectId, payload);
        toast.success("Task created");
      }

      setForm({ ...initialForm });
      setEditingId(null);

      await loadTasks();
    } catch (error) {
      console.error("Unable to save task:", error);

      const backendError = error.response?.data;
      let message = "Unable to save task";

      if (backendError && typeof backendError === "object") {
        const values = Object.values(backendError).flat();

        if (values.length > 0) {
          message = values.join(" ");
        }
      }

      toast.error(message);
    }
  }

  function editTask(task) {
    setEditingId(task.id);

    setForm({
      title: task.title || "",
      description: task.description || "",
      status: task.status || "TODO",
      priority: task.priority || "MEDIUM",
      due_date: task.due_date || "",
      assigned_to_id: task.assigned_to?.id
        ? String(task.assigned_to.id)
        : "",
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelEditing() {
    setEditingId(null);
    setForm({ ...initialForm });
  }

  async function removeTask(id) {
    const confirmed = window.confirm("Delete this task?");

    if (!confirmed) {
      return;
    }

    try {
      await deleteTask(projectId, id);
      toast.success("Task deleted");

      if (editingId === id) {
        cancelEditing();
      }

      await loadTasks();
    } catch (error) {
      console.error("Unable to delete task:", error);
      toast.error("Unable to delete task");
    }
  }

  if (!projectId) {
    return (
      <div className="rounded-[var(--radius-lg)] border border-[var(--color-line)] bg-[var(--color-surface)] p-10 text-center shadow-[var(--shadow-sm)]">
        <h1 className="text-xl font-semibold text-[var(--color-ink)]">
          No project selected
        </h1>

        <p className="mt-2 text-[var(--color-slate-txt)]">
          Select a project before managing tasks.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="rounded-[var(--radius-lg)] border border-[var(--color-line)] bg-[var(--color-surface)] p-10 text-center shadow-[var(--shadow-sm)]">
        <p className="text-[var(--color-slate-txt)]">Loading tasks...</p>
      </div>
    );
  }

  return (
    <div className="space-y-7">
      {/* Header */}
      <div>
        <h1 className="font-[var(--font-display)] text-3xl font-bold text-[var(--color-ink)]">
          Tasks
        </h1>

        <p className="mt-1 text-[var(--color-slate-txt)]">
          Track project work and progress.
        </p>
      </div>

      {/* Create / Edit Task */}
      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-[var(--radius-lg)] border border-[var(--color-line)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-sm)]"
      >
        <h2 className="font-[var(--font-display)] text-lg font-semibold text-[var(--color-ink)]">
          {editingId ? "Edit task" : "Create a task"}
        </h2>

        <div>
          <label htmlFor="task-title" className={labelClass}>
            Task title
          </label>

          <input
            id="task-title"
            required
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="Task title"
            className={fieldClass}
          />
        </div>

        <div>
          <label htmlFor="task-description" className={labelClass}>
            Description
          </label>

          <textarea
            id="task-description"
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="What needs to happen?"
            rows={4}
            className={`${fieldClass} resize-none`}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <div>
            <label htmlFor="task-status" className={labelClass}>
              Status
            </label>

            <select
              id="task-status"
              name="status"
              value={form.status}
              onChange={handleChange}
              className={fieldClass}
            >
              <option value="TODO">To do</option>
              <option value="IN_PROGRESS">In progress</option>
              <option value="IN_REVIEW">In review</option>
              <option value="DONE">Done</option>
            </select>
          </div>

          <div>
            <label htmlFor="task-priority" className={labelClass}>
              Priority
            </label>

            <select
              id="task-priority"
              name="priority"
              value={form.priority}
              onChange={handleChange}
              className={fieldClass}
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </select>
          </div>

          <div>
            <label htmlFor="task-due-date" className={labelClass}>
              Due date
            </label>

            <input
              id="task-due-date"
              type="date"
              name="due_date"
              value={form.due_date}
              onChange={handleChange}
              className={fieldClass}
            />
          </div>

          <div>
            <label htmlFor="task-assignee" className={labelClass}>
              Assign to
            </label>

            <select
              id="task-assignee"
              name="assigned_to_id"
              value={form.assigned_to_id}
              onChange={handleChange}
              className={fieldClass}
            >
              <option value="">Unassigned</option>

              {members.map((member) => (
                <option key={member.id} value={member.user?.id}>
                  {member.user?.username || "Unknown user"}
                  {" — "}
                  {member.role || "Member"}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex gap-2">
          <Button type="submit">
            {editingId ? "Save changes" : "Create task"}
          </Button>

          {editingId && (
            <Button type="button" variant="secondary" onClick={cancelEditing}>
              Cancel
            </Button>
          )}
        </div>
      </form>

      {/* Task list */}
      {tasks.length === 0 ? (
        <div className="rounded-[var(--radius-lg)] border border-[var(--color-line)] bg-[var(--color-surface)] p-8 text-center shadow-[var(--shadow-sm)]">
          <p className="text-[var(--color-slate-txt)]">No tasks found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="rounded-[var(--radius-lg)] border border-[var(--color-line)] bg-[var(--color-surface)] p-5 shadow-[var(--shadow-sm)] transition-shadow duration-150 hover:shadow-[var(--shadow-md)]"
            >
              <div className="flex flex-col justify-between gap-3 md:flex-row">
                <div className="min-w-0">
                  <h2 className="font-[var(--font-display)] text-lg font-semibold text-[var(--color-ink)]">
                    {task.title}
                  </h2>

                  <p className="mt-1 text-sm text-[var(--color-slate-txt)]">
                    {task.description || "No description"}
                  </p>

                  <p className="mt-2 text-sm text-[var(--color-slate-txt)]">
                    Assigned to:{" "}
                    <span className="font-medium text-[var(--color-ink)]">
                      {task.assigned_to?.username || "Unassigned"}
                    </span>
                  </p>

                  {task.due_date && (
                    <p className="mt-1 font-mono text-xs text-[var(--color-slate-faint)]">
                      Due {task.due_date}
                    </p>
                  )}
                </div>

                <div className="flex h-fit shrink-0 gap-2">
                  <Badge tone={STATUS_TONE[task.status] || "neutral"}>
                    {task.status}
                  </Badge>

                  <Badge tone={PRIORITY_TONE[task.priority] || "neutral"}>
                    {task.priority}
                  </Badge>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-4 flex gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => editTask(task)}
                >
                  Edit
                </Button>

                <Button
                  type="button"
                  variant="danger"
                  size="sm"
                  onClick={() => removeTask(task.id)}
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
