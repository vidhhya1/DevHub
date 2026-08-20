import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Users, ChevronDown, ChevronUp, X } from "lucide-react";

import {
  createProject,
  deleteProject,
  getProjects,
  updateProject,
  getMembers,
  addMember,
  updateMember,
  deleteMember,
} from "../../services/projectService";

import { useAuth } from "../../context/useAuth";

import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";

const initialForm = {
  name: "",
  description: "",
  visibility: "PRIVATE",
};

const memberInitialForm = {
  username: "",
  role: "MEMBER",
};

export default function ProjectsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [projects, setProjects] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);

  // Member management state - keyed by project id so multiple
  // project cards can be expanded independently without refetching
  // everything on every keystroke.
  const [expandedProjectId, setExpandedProjectId] = useState(null);
  const [membersByProject, setMembersByProject] = useState({});
  const [membersLoading, setMembersLoading] = useState(false);
  const [memberForm, setMemberForm] = useState(memberInitialForm);
  const [memberFormError, setMemberFormError] = useState("");

  /*
   * Load projects when the page opens.
   *
   * The request is written directly inside the effect
   * so the React hooks ESLint rule does not complain
   * about calling a state-changing function from useEffect.
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
      } catch (error) {
        if (cancelled) {
          return;
        }

        console.error(
          "Unable to load projects:",
          error
        );

        toast.error("Unable to load projects");
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchProjects();

    return () => {
      cancelled = true;
    };
  }, []);

  /*
   * Reusable project loader for actions such as
   * create, update and delete.
   */
  async function loadProjects() {
    const response = await getProjects();

    const data = Array.isArray(response.data)
      ? response.data
      : response.data?.results || [];

    setProjects(data);
  }

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!form.name.trim()) {
      toast.error("Project name is required");
      return;
    }

    try {
      if (editingId) {
        await updateProject(editingId, form);

        toast.success("Project updated");
      } else {
        const response = await createProject(form);

        localStorage.setItem(
          "selectedProjectId",
          String(response.data.id)
        );

        toast.success("Project created");
      }

      setForm(initialForm);
      setEditingId(null);

      await loadProjects();
    } catch (error) {
      console.error(
        "Unable to save project:",
        error
      );

      const message =
        Object.values(
          error.response?.data || {}
        ).flat()[0] ||
        "Unable to save project";

      toast.error(String(message));
    }
  }

  function startEditing(project) {
    setEditingId(project.id);

    setForm({
      name: project.name || "",
      description: project.description || "",
      visibility: project.visibility || "PRIVATE",
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function cancelEditing() {
    setEditingId(null);
    setForm(initialForm);
  }

  async function handleDelete(id) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this project?"
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteProject(id);

      const selectedProjectId =
        localStorage.getItem(
          "selectedProjectId"
        );

      if (
        String(selectedProjectId) ===
        String(id)
      ) {
        localStorage.removeItem(
          "selectedProjectId"
        );
      }

      toast.success("Project deleted");

      await loadProjects();
    } catch (error) {
      console.error(
        "Unable to delete project:",
        error
      );

      toast.error("Unable to delete project");
    }
  }

  function openProject(id) {
    localStorage.setItem(
      "selectedProjectId",
      String(id)
    );

    navigate("/dashboard");
  }

  /*
   * Members: expand/collapse a project card and lazily load its
   * member list the first time it's opened.
   */
  async function toggleMembers(projectId) {
    if (expandedProjectId === projectId) {
      setExpandedProjectId(null);
      return;
    }

    setExpandedProjectId(projectId);
    setMemberForm(memberInitialForm);
    setMemberFormError("");

    if (membersByProject[projectId]) {
      return;
    }

    try {
      setMembersLoading(true);

      const response = await getMembers(projectId);

      const data = Array.isArray(response.data)
        ? response.data
        : response.data?.results || [];

      setMembersByProject((previous) => ({
        ...previous,
        [projectId]: data,
      }));
    } catch (error) {
      console.error("Unable to load members:", error);
      toast.error("Unable to load members");
    } finally {
      setMembersLoading(false);
    }
  }

  async function reloadMembers(projectId) {
    const response = await getMembers(projectId);

    const data = Array.isArray(response.data)
      ? response.data
      : response.data?.results || [];

    setMembersByProject((previous) => ({
      ...previous,
      [projectId]: data,
    }));
  }

  function handleMemberFormChange(event) {
    const { name, value } = event.target;

    setMemberForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function handleAddMember(event, projectId) {
    event.preventDefault();
    setMemberFormError("");

    if (!memberForm.username.trim()) {
      setMemberFormError("Username is required");
      return;
    }

    try {
      await addMember(projectId, {
        username: memberForm.username.trim(),
        role: memberForm.role,
      });

      toast.success("Member added");
      setMemberForm(memberInitialForm);

      await reloadMembers(projectId);
    } catch (error) {
      console.error("Unable to add member:", error);

      const message =
        Object.values(error.response?.data || {}).flat()[0] ||
        "Unable to add member";

      setMemberFormError(String(message));
    }
  }

  async function handleRoleChange(projectId, memberId, role) {
    try {
      await updateMember(projectId, memberId, { role });
      toast.success("Role updated");
      await reloadMembers(projectId);
    } catch (error) {
      console.error("Unable to update member role:", error);
      toast.error("Unable to update member role");
    }
  }

  async function handleRemoveMember(projectId, memberId) {
    const confirmed = window.confirm(
      "Remove this member from the project?"
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteMember(projectId, memberId);
      toast.success("Member removed");
      await reloadMembers(projectId);
    } catch (error) {
      console.error("Unable to remove member:", error);

      const message =
        error.response?.data?.detail ||
        "Unable to remove member";

      toast.error(String(message));
    }
  }

  return (
    <div className="space-y-7">
      {/* Page Header */}
      <div>
        <h1 className="font-[var(--font-display)] text-3xl font-bold text-[var(--color-ink)]">
          Projects
        </h1>

        <p className="mt-1 text-[var(--color-slate-txt)]">
          Create and manage your development projects.
        </p>
      </div>

      {/* Create / Edit Project */}
      <form
        onSubmit={handleSubmit}
        className="rounded-[var(--radius-lg)] border border-[var(--color-line)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-sm)]"
      >
        <h2 className="mb-4 font-[var(--font-display)] text-lg font-semibold text-[var(--color-ink)]">
          {editingId ? "Edit project" : "Create a project"}
        </h2>

        <div className="grid gap-4 md:grid-cols-2">
          {/* Project Name */}
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Project name"
            maxLength={200}
            required
            className="rounded-[var(--radius-md)] border border-[var(--color-line)] bg-[var(--color-surface)] px-3.5 py-2.5 text-sm text-[var(--color-ink)] outline-none transition-colors duration-150 placeholder:text-[var(--color-slate-faint)] focus:border-[var(--color-accent)]"
          />

          {/* Visibility */}
          <select
            name="visibility"
            value={form.visibility}
            onChange={handleChange}
            className="rounded-[var(--radius-md)] border border-[var(--color-line)] bg-[var(--color-surface)] px-3.5 py-2.5 text-sm text-[var(--color-ink)] outline-none transition-colors duration-150 focus:border-[var(--color-accent)]"
          >
            <option value="PRIVATE">Private</option>
            <option value="PUBLIC">Public</option>
          </select>
        </div>

        {/* Description */}
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="What's this project about?"
          rows={4}
          className="mt-4 w-full resize-none rounded-[var(--radius-md)] border border-[var(--color-line)] bg-[var(--color-surface)] px-3.5 py-3 text-sm text-[var(--color-ink)] outline-none transition-colors duration-150 placeholder:text-[var(--color-slate-faint)] focus:border-[var(--color-accent)]"
        />

        {/* Form Buttons */}
        <div className="mt-4 flex gap-2">
          <Button type="submit">
            {editingId ? "Save changes" : "Create project"}
          </Button>

          {editingId && (
            <Button
              type="button"
              variant="secondary"
              onClick={cancelEditing}
            >
              Cancel
            </Button>
          )}
        </div>
      </form>

      {/* Projects List */}
      {loading ? (
        <div className="rounded-[var(--radius-lg)] border border-[var(--color-line)] bg-[var(--color-surface)] p-8 text-center">
          <p className="text-[var(--color-slate-txt)]">
            Loading projects...
          </p>
        </div>
      ) : projects.length === 0 ? (
        <div className="rounded-[var(--radius-lg)] border border-[var(--color-line)] bg-[var(--color-surface)] p-8 text-center shadow-[var(--shadow-sm)]">
          <h2 className="font-[var(--font-display)] text-lg font-semibold text-[var(--color-ink)]">
            No projects yet
          </h2>

          <p className="mt-2 text-[var(--color-slate-txt)]">
            Create your first project above.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {projects.map((project) => {
            const isOwner =
              user &&
              String(project.owner) === String(user.id);

            const isExpanded =
              expandedProjectId === project.id;

            const members =
              membersByProject[project.id] || [];


            return (
              <div
                key={project.id}
                className="rounded-[var(--radius-lg)] border border-[var(--color-line)] bg-[var(--color-surface)] p-5 shadow-[var(--shadow-sm)] transition-shadow duration-150 hover:shadow-[var(--shadow-md)]"
              >
                {/* Project Header */}
                <div className="flex justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="font-[var(--font-display)] text-xl font-semibold text-[var(--color-ink)]">
                      {project.name}
                    </h2>

                    <p className="mt-1 text-sm text-[var(--color-slate-txt)]">
                      {project.description || "No description"}
                    </p>
                  </div>

                  <span className="h-fit shrink-0">
                    <Badge tone={project.visibility === "PUBLIC" ? "green" : "neutral"}>
                      {project.visibility}
                    </Badge>
                  </span>
                </div>

                {/* Project Actions */}
                <div className="mt-5 flex flex-wrap gap-2">
                  <Button
                    type="button"
                    onClick={() =>
                      openProject(project.id)
                    }
                  >
                    Open
                  </Button>

                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() =>
                      toggleMembers(project.id)
                    }
                  >
                    <span className="flex items-center gap-1.5">
                      <Users size={15} />
                      Members
                      {isExpanded ? (
                        <ChevronUp size={15} />
                      ) : (
                        <ChevronDown size={15} />
                      )}
                    </span>
                  </Button>

                  {/*
                    Edit/Delete are ownership-restricted server-side
                    (only the project owner can update or delete a
                    project), so we only render them for the owner.
                    This is a UX improvement only - the backend
                    remains the source of truth for authorization.
                  */}
                  {isOwner && (
                    <>
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() =>
                          startEditing(project)
                        }
                      >
                        Edit
                      </Button>

                      <Button
                        type="button"
                        variant="danger"
                        onClick={() =>
                          handleDelete(project.id)
                        }
                      >
                        Delete
                      </Button>
                    </>
                  )}
                </div>

                {/* Members Panel */}
                {isExpanded && (
                  <div className="mt-5 border-t border-[var(--color-line)] pt-4">
                    {membersLoading &&
                    !membersByProject[project.id] ? (
                      <p className="text-sm text-[var(--color-slate-txt)]">
                        Loading members...
                      </p>
                    ) : members.length === 0 ? (
                      <p className="text-sm text-[var(--color-slate-txt)]">
                        No members yet.
                      </p>
                    ) : (
                      <ul className="space-y-2">
                        {members.map((member) => (
                          <li
                            key={member.id}
                            className="flex items-center justify-between gap-2 rounded-[var(--radius-md)] bg-[var(--color-canvas)] px-3 py-2"
                          >
                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium text-[var(--color-ink)]">
                                {member.user?.username}
                              </p>

                              <p className="truncate text-xs text-[var(--color-slate-txt)]">
                                {member.user?.email}
                              </p>
                            </div>

                            {isOwner &&
                            member.role !== "OWNER" ? (
                              <div className="flex shrink-0 items-center gap-2">
                                <select
                                  value={member.role}
                                  onChange={(event) =>
                                    handleRoleChange(
                                      project.id,
                                      member.id,
                                      event.target.value
                                    )
                                  }
                                  className="rounded-[var(--radius-sm)] border border-[var(--color-line)] bg-[var(--color-surface)] px-2 py-1 text-xs outline-none focus:border-[var(--color-accent)]"
                                >
                                  <option value="MAINTAINER">
                                    Maintainer
                                  </option>

                                  <option value="MEMBER">
                                    Member
                                  </option>
                                </select>

                                <button
                                  type="button"
                                  onClick={() =>
                                    handleRemoveMember(
                                      project.id,
                                      member.id
                                    )
                                  }
                                  title="Remove member"
                                  className="rounded-[var(--radius-sm)] p-1 text-[var(--color-slate-faint)] transition-colors duration-150 hover:bg-[var(--color-signal-rose-soft)] hover:text-[var(--color-signal-rose)]"
                                >
                                  <X size={15} />
                                </button>
                              </div>
                            ) : (
                              <Badge tone="accent">{member.role}</Badge>
                            )}
                          </li>
                        ))}
                      </ul>
                    )}

                    {/*
                      The backend only lets the owner add members
                      (IsProjectOwnerForMemberManagement), so the
                      add-member form is owner-only here too.
                    */}
                    {isOwner && (
                      <form
                        onSubmit={(event) =>
                          handleAddMember(event, project.id)
                        }
                        className="mt-4 flex flex-wrap items-start gap-2"
                      >
                        <input
                          name="username"
                          value={memberForm.username}
                          onChange={handleMemberFormChange}
                          placeholder="Username to add"
                          className="min-w-0 flex-1 rounded-[var(--radius-md)] border border-[var(--color-line)] bg-[var(--color-surface)] px-3 py-1.5 text-sm outline-none focus:border-[var(--color-accent)]"
                        />

                        <select
                          name="role"
                          value={memberForm.role}
                          onChange={handleMemberFormChange}
                          className="rounded-[var(--radius-md)] border border-[var(--color-line)] bg-[var(--color-surface)] px-2 py-1.5 text-sm outline-none focus:border-[var(--color-accent)]"
                        >
                          <option value="MEMBER">Member</option>
                          <option value="MAINTAINER">Maintainer</option>
                        </select>

                        <Button type="submit" size="sm">
                          Add
                        </Button>

                        {memberFormError && (
                          <p className="w-full text-xs font-medium text-[var(--color-signal-rose)]">
                            {memberFormError}
                          </p>
                        )}
                      </form>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}