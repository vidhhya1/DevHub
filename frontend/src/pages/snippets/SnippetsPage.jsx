import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { History, Plus } from "lucide-react";
import toast from "react-hot-toast";

import {
  createSnippet,
  deleteSnippet,
  getSnippets,
  updateSnippet,
} from "../../services/snippetService";

import { createTag, getTags } from "../../services/tagService";

import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";

const initialForm = {
  title: "",
  description: "",
  language: "PYTHON",
  code: "",
  tag_ids: [],
  version_message: "Initial version",
};

const fieldClass =
  "w-full rounded-[var(--radius-md)] border border-[var(--color-line)] " +
  "bg-[var(--color-surface)] px-3.5 py-2.5 text-sm text-[var(--color-ink)] " +
  "outline-none transition-colors duration-150 placeholder:text-[var(--color-slate-faint)] " +
  "focus:border-[var(--color-accent)]";

const labelClass = "mb-1.5 block text-sm font-medium text-[var(--color-ink)]";

export default function SnippetsPage() {
  const projectId = localStorage.getItem("selectedProjectId");

  const [snippets, setSnippets] = useState([]);
  const [tags, setTags] = useState([]);
  const [newTagName, setNewTagName] = useState("");
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadSnippets = useCallback(async () => {
    if (!projectId) {
      return;
    }

    const response = await getSnippets(projectId);

    const data = Array.isArray(response.data)
      ? response.data
      : response.data?.results || [];

    setSnippets(data);
  }, [projectId]);

  const loadTags = useCallback(async () => {
    const response = await getTags();

    const data = Array.isArray(response.data)
      ? response.data
      : response.data?.results || [];

    setTags(data);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!projectId) {
        setLoading(false);
        return;
      }

      Promise.all([loadSnippets(), loadTags()])
        .catch((error) => {
          console.error("Unable to load snippets:", error);
          toast.error("Unable to load snippets");
        })
        .finally(() => {
          setLoading(false);
        });
    }, 0);

    return () => {
      clearTimeout(timer);
    };
  }, [projectId, loadSnippets, loadTags]);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function toggleTag(tagId) {
    setForm((previous) => {
      const alreadySelected = previous.tag_ids.includes(tagId);

      return {
        ...previous,
        tag_ids: alreadySelected
          ? previous.tag_ids.filter((id) => id !== tagId)
          : [...previous.tag_ids, tagId],
      };
    });
  }

  async function handleCreateTag(event) {
    event.preventDefault();

    const name = newTagName.trim();

    if (!name) {
      return;
    }

    try {
      const response = await createTag({ name });
      const created = response.data;

      toast.success(`Tag "${created.name}" created`);
      setNewTagName("");

      // Refresh the tag list and auto-select the new tag so it's
      // ready to attach to the snippet being created/edited.
      await loadTags();

      setForm((previous) => ({
        ...previous,
        tag_ids: [...previous.tag_ids, created.id],
      }));
    } catch (error) {
      console.error("Unable to create tag:", error);

      const backendError = error.response?.data;
      const message =
        (backendError && Object.values(backendError).flat()[0]) ||
        "Unable to create tag";

      toast.error(String(message));
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!form.title.trim()) {
      toast.error("Snippet title is required");
      return;
    }

    if (!form.code.trim()) {
      toast.error("Snippet code is required");
      return;
    }

    try {
      const data = {
        ...form,
        title: form.title.trim(),
        description: form.description.trim(),
        code: form.code,
        version_message: form.version_message.trim(),
      };

      if (editingId) {
        await updateSnippet(projectId, editingId, data);
        toast.success("Snippet updated");
      } else {
        await createSnippet(projectId, data);
        toast.success("Snippet created");
      }

      setForm({ ...initialForm, tag_ids: [] });
      setEditingId(null);

      await loadSnippets();
    } catch (error) {
      console.error("Unable to save snippet:", error);

      const backendError = error.response?.data;
      let message = "Unable to save snippet";

      if (backendError && typeof backendError === "object") {
        const values = Object.values(backendError).flat();

        if (values.length > 0) {
          message = values.join(" ");
        }
      }

      toast.error(message);
    }
  }

  function editSnippet(snippet) {
    setEditingId(snippet.id);

    setForm({
      title: snippet.title || "",
      description: snippet.description || "",
      language: snippet.language || "PYTHON",
      code: snippet.code || "",
      tag_ids: snippet.tags?.map((tag) => tag.id) || [],
      version_message: "Updated snippet",
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelEditing() {
    setEditingId(null);
    setForm({ ...initialForm, tag_ids: [] });
  }

  async function removeSnippet(id) {
    const confirmed = window.confirm("Delete this snippet?");

    if (!confirmed) {
      return;
    }

    try {
      await deleteSnippet(projectId, id);
      toast.success("Snippet deleted");

      if (editingId === id) {
        cancelEditing();
      }

      await loadSnippets();
    } catch (error) {
      console.error("Unable to delete snippet:", error);
      toast.error("Unable to delete snippet");
    }
  }

  if (!projectId) {
    return (
      <div className="rounded-[var(--radius-lg)] border border-[var(--color-line)] bg-[var(--color-surface)] p-10 text-center shadow-[var(--shadow-sm)]">
        <h1 className="text-xl font-semibold text-[var(--color-ink)]">
          No project selected
        </h1>

        <p className="mt-2 text-[var(--color-slate-txt)]">
          Select a project before managing snippets.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="rounded-[var(--radius-lg)] border border-[var(--color-line)] bg-[var(--color-surface)] p-10 text-center shadow-[var(--shadow-sm)]">
        <p className="text-[var(--color-slate-txt)]">Loading snippets...</p>
      </div>
    );
  }

  return (
    <div className="space-y-7">
      {/* Header */}
      <div>
        <h1 className="font-[var(--font-display)] text-3xl font-bold text-[var(--color-ink)]">
          Code snippets
        </h1>

        <p className="mt-1 text-[var(--color-slate-txt)]">
          Store and manage reusable code.
        </p>
      </div>

      {/* Create / Edit Form */}
      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-[var(--radius-lg)] border border-[var(--color-line)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-sm)]"
      >
        <h2 className="font-[var(--font-display)] text-lg font-semibold text-[var(--color-ink)]">
          {editingId ? "Edit snippet" : "Create a snippet"}
        </h2>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="snippet-title" className={labelClass}>
              Title
            </label>

            <input
              id="snippet-title"
              required
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Snippet title"
              className={fieldClass}
            />
          </div>

          <div>
            <label htmlFor="snippet-language" className={labelClass}>
              Language
            </label>

            <select
              id="snippet-language"
              name="language"
              value={form.language}
              onChange={handleChange}
              className={fieldClass}
            >
              <option value="PYTHON">Python</option>
              <option value="CPP">C++</option>
              <option value="C">C</option>
              <option value="JAVA">Java</option>
              <option value="JAVASCRIPT">JavaScript</option>
              <option value="TYPESCRIPT">TypeScript</option>
              <option value="GO">Go</option>
              <option value="RUST">Rust</option>
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="snippet-description" className={labelClass}>
            Description
          </label>

          <input
            id="snippet-description"
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Description"
            className={fieldClass}
          />
        </div>

        <div>
          <label htmlFor="snippet-code" className={labelClass}>
            Code
          </label>

          <textarea
            id="snippet-code"
            required
            name="code"
            value={form.code}
            onChange={handleChange}
            placeholder="Write your code..."
            rows={12}
            spellCheck={false}
            className="w-full rounded-[var(--radius-md)] border border-[var(--color-line)] bg-[var(--color-ink)] p-4 font-mono text-sm text-slate-100 outline-none transition-colors duration-150 focus:border-[var(--color-accent)]"
          />
        </div>

        <div>
          <label htmlFor="version-message" className={labelClass}>
            Version message
          </label>

          <input
            id="version-message"
            name="version_message"
            value={form.version_message}
            onChange={handleChange}
            placeholder="Version message"
            className={fieldClass}
          />
        </div>

        <div>
          <label htmlFor="new-tag-name" className={labelClass}>
            Tags
          </label>

          {/*
            Create a new tag inline - there was previously no way to
            add a tag anywhere in the UI, so on a fresh account this
            whole section stayed permanently empty.
          */}
          <div className="flex gap-2">
            <input
              id="new-tag-name"
              value={newTagName}
              onChange={(event) => setNewTagName(event.target.value)}
              placeholder="New tag name"
              className={fieldClass}
            />

            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={handleCreateTag}
            >
              <span className="flex items-center gap-1.5">
                <Plus size={15} />
                Add tag
              </span>
            </Button>
          </div>

          {tags.length > 0 ? (
            <>
              {/*
                Click-to-toggle chips instead of a native <select
                multiple>. The native multi-select required Ctrl+click
                and gave no clear confirmation of what was actually
                selected at submit time - easy to think a tag is
                attached when it isn't. Each chip's own selected/
                unselected style is the only state that matters here.
              */}
              <div className="mt-3 flex flex-wrap gap-2 rounded-[var(--radius-md)] border border-[var(--color-line)] bg-[var(--color-surface)] p-3">
                {tags.map((tag) => {
                  const selected = form.tag_ids.includes(tag.id);

                  return (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => toggleTag(tag.id)}
                      aria-pressed={selected}
                      className={
                        "rounded-[var(--radius-sm)] border px-2.5 py-1.5 font-mono text-xs font-medium " +
                        "transition-colors duration-150 " +
                        (selected
                          ? "border-[var(--color-accent)] bg-[var(--color-accent)] text-white"
                          : "border-[var(--color-line)] bg-[var(--color-canvas)] text-[var(--color-slate-txt)] hover:border-[var(--color-accent)]")
                      }
                    >
                      {tag.name}
                    </button>
                  );
                })}
              </div>

              <p className="mt-1.5 text-xs text-[var(--color-slate-faint)]">
                Click a tag to attach or remove it from this snippet.
                {form.tag_ids.length > 0 &&
                  ` Selected: ${form.tag_ids.length}.`}
              </p>
            </>
          ) : (
            <p className="mt-2 text-xs text-[var(--color-slate-faint)]">
              No tags yet — create one above to attach it to this snippet.
            </p>
          )}
        </div>

        <div className="flex gap-2">
          <Button type="submit">
            {editingId ? "Save changes" : "Create snippet"}
          </Button>

          {editingId && (
            <Button type="button" variant="secondary" onClick={cancelEditing}>
              Cancel
            </Button>
          )}
        </div>
      </form>

      {/* Snippets */}
      {snippets.length === 0 ? (
        <div className="rounded-[var(--radius-lg)] border border-[var(--color-line)] bg-[var(--color-surface)] p-10 text-center shadow-[var(--shadow-sm)]">
          <h2 className="font-[var(--font-display)] text-lg font-semibold text-[var(--color-ink)]">
            No snippets yet
          </h2>

          <p className="mt-2 text-[var(--color-slate-txt)]">
            Create your first code snippet above.
          </p>
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          {snippets.map((snippet) => (
            <article
              key={snippet.id}
              className="rounded-[var(--radius-lg)] border border-[var(--color-line)] bg-[var(--color-surface)] p-5 shadow-[var(--shadow-sm)]"
            >
              <div className="flex justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="font-[var(--font-display)] text-xl font-semibold text-[var(--color-ink)]">
                    {snippet.title}
                  </h2>

                  <p className="mt-1 text-sm text-[var(--color-slate-txt)]">
                    {snippet.description || "No description"}
                  </p>
                </div>

                <span className="h-fit shrink-0">
                  <Badge tone="accent">{snippet.language}</Badge>
                </span>
              </div>

              <pre className="mt-4 max-h-72 overflow-auto rounded-[var(--radius-md)] bg-[var(--color-ink)] p-4 font-mono text-sm text-slate-100">
                <code>{snippet.code}</code>
              </pre>

              {snippet.tags?.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {snippet.tags.map((tag) => (
                    <Badge key={tag.id} tone="neutral">
                      {tag.name}
                    </Badge>
                  ))}
                </div>
              )}

              <div className="mt-4 flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => editSnippet(snippet)}
                >
                  Edit
                </Button>

                <Button
                  type="button"
                  variant="danger"
                  size="sm"
                  onClick={() => removeSnippet(snippet.id)}
                >
                  Delete
                </Button>

                <Link
                  to={`/snippets/${snippet.id}/versions`}
                  className="inline-flex items-center gap-1.5 rounded-[var(--radius-md)] bg-[var(--color-line-soft)] px-3 py-1.5 text-xs font-medium text-[var(--color-slate-txt)] transition-colors duration-150 hover:bg-[var(--color-line)] hover:text-[var(--color-ink)]"
                >
                  <History size={13} />
                  Versions
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}