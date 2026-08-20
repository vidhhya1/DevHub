import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";

import { useAuth } from "../../context/useAuth";

import { getTasks } from "../../services/taskService";

import {
  getReviews,
  createReview,
  updateReview,
  deleteReview,
} from "../../services/reviewService";

import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";

const REVIEW_STATUS_TONE = {
  PENDING: "amber",
  APPROVED: "green",
  CHANGES_REQUESTED: "rose",
};

const fieldClass =
  "w-full rounded-[var(--radius-md)] border border-[var(--color-line)] " +
  "bg-[var(--color-surface)] px-3.5 py-2.5 text-sm text-[var(--color-ink)] " +
  "outline-none transition-colors duration-150 placeholder:text-[var(--color-slate-faint)] " +
  "focus:border-[var(--color-accent)]";

const labelClass = "mb-1.5 block text-sm font-medium text-[var(--color-ink)]";

export default function ReviewsPage() {
  const projectId = localStorage.getItem("selectedProjectId");

  const { user } = useAuth();

  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState("");
  const [reviews, setReviews] = useState([]);
  const [comment, setComment] = useState("");
  const [status, setStatus] = useState("PENDING");
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);

  /*
   * Load tasks belonging to the currently selected project.
   */
  const loadTasks = useCallback(async () => {
    if (!projectId) {
      return;
    }

    const response = await getTasks(projectId);

    const data = Array.isArray(response.data)
      ? response.data
      : response.data?.results || [];

    setTasks(data);

    if (data.length > 0) {
      setSelectedTask((current) => {
        if (current) {
          return current;
        }

        return String(data[0].id);
      });
    } else {
      setSelectedTask("");
    }
  }, [projectId]);

  /*
   * Load reviews for the selected task.
   */
  const loadReviews = useCallback(async (taskId) => {
    if (!taskId) {
      setReviews([]);
      return;
    }

    const response = await getReviews(taskId);

    const data = Array.isArray(response.data)
      ? response.data
      : response.data?.results || [];

    setReviews(data);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!projectId) {
        setLoading(false);
        return;
      }

      loadTasks()
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
  }, [projectId, loadTasks]);

  useEffect(() => {
    if (!selectedTask) {
      return undefined;
    }

    const timer = setTimeout(() => {
      loadReviews(selectedTask).catch((error) => {
        console.error("Unable to load reviews:", error);
        toast.error("Unable to load reviews");
      });
    }, 0);

    return () => {
      clearTimeout(timer);
    };
  }, [selectedTask, loadReviews]);

  async function handleSubmit(event) {
    event.preventDefault();

    if (!selectedTask) {
      toast.error("Select a task first");
      return;
    }

    if (!comment.trim()) {
      toast.error("Review comment cannot be empty");
      return;
    }

    try {
      const data = { comment: comment.trim(), status };

      if (editingId) {
        await updateReview(selectedTask, editingId, data);
        toast.success("Review updated");
      } else {
        await createReview(selectedTask, data);
        toast.success("Review created");
      }

      setComment("");
      setStatus("PENDING");
      setEditingId(null);

      await loadReviews(selectedTask);
    } catch (error) {
      console.error("Unable to save review:", error);

      const backendError = error.response?.data;
      let message = "Unable to save review";

      if (backendError && typeof backendError === "object") {
        const values = Object.values(backendError).flat();

        if (values.length > 0) {
          message = values.join(" ");
        }
      }

      toast.error(message);
    }
  }

  function startEditing(review) {
    setEditingId(review.id);
    setComment(review.comment || "");
    setStatus(review.status || "PENDING");
  }

  function cancelEditing() {
    setEditingId(null);
    setComment("");
    setStatus("PENDING");
  }

  async function removeReview(id) {
    const confirmed = window.confirm("Delete this review?");

    if (!confirmed) {
      return;
    }

    try {
      await deleteReview(selectedTask, id);
      toast.success("Review deleted");

      if (editingId === id) {
        cancelEditing();
      }

      await loadReviews(selectedTask);
    } catch (error) {
      console.error("Unable to delete review:", error);
      toast.error("Unable to delete review");
    }
  }

  /*
   * Frontend permission check.
   *
   * IMPORTANT: this only controls the UI. The backend must also
   * enforce review permissions.
   */
  function isMyReview(review) {
    return String(review.reviewer?.id) === String(user?.id);
  }

  if (!projectId) {
    return (
      <div className="rounded-[var(--radius-lg)] border border-[var(--color-line)] bg-[var(--color-surface)] p-10 text-center shadow-[var(--shadow-sm)]">
        <h1 className="text-xl font-semibold text-[var(--color-ink)]">
          No project selected
        </h1>

        <p className="mt-2 text-[var(--color-slate-txt)]">
          Select a project before managing reviews.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="rounded-[var(--radius-lg)] border border-[var(--color-line)] bg-[var(--color-surface)] p-10 text-center shadow-[var(--shadow-sm)]">
        <p className="text-[var(--color-slate-txt)]">Loading reviews...</p>
      </div>
    );
  }

  return (
    <div className="space-y-7">
      {/* Header */}
      <div>
        <h1 className="font-[var(--font-display)] text-3xl font-bold text-[var(--color-ink)]">
          Code reviews
        </h1>

        <p className="mt-1 text-[var(--color-slate-txt)]">
          Review and discuss project tasks.
        </p>
      </div>

      {/* Create / Edit Review */}
      <div className="rounded-[var(--radius-lg)] border border-[var(--color-line)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-sm)]">
        <div className="mb-5">
          <label htmlFor="review-task" className={labelClass}>
            Select task
          </label>

          <select
            id="review-task"
            value={selectedTask}
            onChange={(event) => {
              setSelectedTask(event.target.value);
              cancelEditing();
            }}
            className={fieldClass}
          >
            {tasks.length === 0 ? (
              <option value="">No tasks available</option>
            ) : (
              tasks.map((task) => (
                <option key={task.id} value={task.id}>
                  {task.title}
                </option>
              ))
            )}
          </select>
        </div>

        {tasks.length > 0 && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="review-status" className={labelClass}>
                Review status
              </label>

              <select
                id="review-status"
                value={status}
                onChange={(event) => setStatus(event.target.value)}
                className={fieldClass}
              >
                <option value="PENDING">Pending</option>
                <option value="APPROVED">Approved</option>
                <option value="CHANGES_REQUESTED">Changes requested</option>
              </select>
            </div>

            <div>
              <label htmlFor="review-comment" className={labelClass}>
                Comment
              </label>

              <textarea
                id="review-comment"
                required
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                placeholder="Write your review..."
                rows={5}
                className={`${fieldClass} resize-none`}
              />
            </div>

            <div className="flex gap-2">
              <Button type="submit">
                {editingId ? "Save changes" : "Submit review"}
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
        )}
      </div>

      {/* Reviews List */}
      <div className="space-y-3">
        {reviews.length === 0 ? (
          <div className="rounded-[var(--radius-lg)] border border-[var(--color-line)] bg-[var(--color-surface)] p-8 text-center shadow-[var(--shadow-sm)]">
            <p className="text-[var(--color-slate-txt)]">
              No reviews for this task yet.
            </p>
          </div>
        ) : (
          reviews.map((review) => {
            const canEdit = isMyReview(review);

            return (
              <article
                key={review.id}
                className="rounded-[var(--radius-lg)] border border-[var(--color-line)] bg-[var(--color-surface)] p-5 shadow-[var(--shadow-sm)]"
              >
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                  <div>
                    <h3 className="font-semibold text-[var(--color-ink)]">
                      {review.reviewer?.username || "Reviewer"}
                    </h3>

                    <div className="mt-1.5">
                      <Badge tone={REVIEW_STATUS_TONE[review.status] || "neutral"}>
                        {review.status}
                      </Badge>
                    </div>
                  </div>

                  {canEdit && (
                    <Badge tone="accent">Your review</Badge>
                  )}
                </div>

                <p className="mt-4 whitespace-pre-wrap text-[var(--color-slate-txt)]">
                  {review.comment}
                </p>

                {canEdit && (
                  <div className="mt-4 flex gap-2">
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => startEditing(review)}
                    >
                      Edit
                    </Button>

                    <Button
                      type="button"
                      variant="danger"
                      size="sm"
                      onClick={() => removeReview(review.id)}
                    >
                      Delete
                    </Button>
                  </div>
                )}
              </article>
            );
          })
        )}
      </div>
    </div>
  );
}
