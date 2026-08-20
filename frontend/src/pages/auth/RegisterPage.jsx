import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Terminal } from "lucide-react";
import toast from "react-hot-toast";

import { registerUser } from "../../services/authService";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";

export default function RegisterPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    bio: "",
    github_url: "",
    linkedin_url: "",
    organization: "",
  });

  const [loading, setLoading] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!form.username || !form.email || !form.password) {
      toast.error("Username, email and password are required");
      return;
    }

    try {
      setLoading(true);

      await registerUser(form);

      toast.success("Account created — sign in to continue");

      navigate("/login");
    } catch (error) {
      console.error(error);

      const data = error.response?.data;

      if (data) {
        const firstError = Object.values(data)[0];

        if (Array.isArray(firstError)) {
          toast.error(firstError[0]);
        } else {
          toast.error(String(firstError));
        }
      } else {
        toast.error("Registration failed");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-canvas)] px-4 py-10">
      <div className="w-full max-w-lg rounded-[var(--radius-lg)] border border-[var(--color-line)] bg-[var(--color-surface)] p-8 shadow-[var(--shadow-md)]">
        <div className="mb-8 flex flex-col items-center text-center">
          <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-ink)] text-[var(--color-accent)]">
            <Terminal size={20} strokeWidth={2.5} />
          </span>

          <h1 className="font-[var(--font-display)] text-2xl font-bold text-[var(--color-ink)]">
            Create your account
          </h1>

          <p className="mt-1.5 text-sm text-[var(--color-slate-txt)]">
            Start collaborating on projects in minutes.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Username *"
              type="text"
              name="username"
              value={form.username}
              onChange={handleChange}
              placeholder="yourusername"
              autoComplete="username"
            />

            <Input
              label="Email *"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              autoComplete="email"
            />
          </div>

          <Input
            label="Password *"
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Create a password"
            autoComplete="new-password"
          />

          <Input
            label="Organization"
            type="text"
            name="organization"
            value={form.organization}
            onChange={handleChange}
            placeholder="Company / college / team"
          />

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-[var(--color-ink)]">
              Bio
            </span>

            <textarea
              name="bio"
              value={form.bio}
              onChange={handleChange}
              placeholder="A short line about what you build"
              rows={3}
              className="w-full resize-none rounded-[var(--radius-md)] border border-[var(--color-line)] bg-[var(--color-surface)] px-3.5 py-2.5 text-sm text-[var(--color-ink)] placeholder:text-[var(--color-slate-faint)] outline-none transition-colors duration-150 focus:border-[var(--color-accent)]"
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="GitHub URL"
              type="url"
              name="github_url"
              value={form.github_url}
              onChange={handleChange}
              placeholder="github.com/username"
            />

            <Input
              label="LinkedIn URL"
              type="url"
              name="linkedin_url"
              value={form.linkedin_url}
              onChange={handleChange}
              placeholder="linkedin.com/in/username"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="mt-2 w-full"
            size="lg"
          >
            {loading ? "Creating account..." : "Create account"}
          </Button>
        </form>

        <div className="mt-7 border-t border-[var(--color-line)] pt-5 text-center">
          <p className="text-sm text-[var(--color-slate-txt)]">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-semibold text-[var(--color-accent)] hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
