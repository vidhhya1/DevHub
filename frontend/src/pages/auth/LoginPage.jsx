import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Terminal } from "lucide-react";
import toast from "react-hot-toast";

import {
  loginUser,
  getCurrentUser,
} from "../../services/authService";

import { useAuth } from "../../context/useAuth";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({
    username: "",
    password: "",
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

    if (!form.username || !form.password) {
      toast.error("Please enter username and password");
      return;
    }

    try {
      setLoading(true);

      const response = await loginUser(form);

      localStorage.setItem(
        "access",
        response.data.access
      );

      localStorage.setItem(
        "refresh",
        response.data.refresh
      );

      const userResponse = await getCurrentUser();

      login(userResponse.data);

      toast.success("Login successful");

      navigate("/dashboard");

    } catch (error) {
      console.error(error);

      const message =
        error.response?.data?.detail ||
        "Invalid username or password";

      toast.error(message);

    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-canvas)] px-4">
      <div className="w-full max-w-md rounded-[var(--radius-lg)] border border-[var(--color-line)] bg-[var(--color-surface)] p-8 shadow-[var(--shadow-md)]">
        <div className="mb-8 flex flex-col items-center text-center">
          <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-ink)] text-[var(--color-accent)]">
            <Terminal size={20} strokeWidth={2.5} />
          </span>

          <h1 className="font-[var(--font-display)] text-2xl font-bold text-[var(--color-ink)]">
            Sign in to DevHub
          </h1>

          <p className="mt-1.5 text-sm text-[var(--color-slate-txt)]">
            Your projects, tasks and reviews in one place.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Username"
            type="text"
            name="username"
            value={form.username}
            onChange={handleChange}
            placeholder="yourusername"
            autoComplete="username"
          />

          <Input
            label="Password"
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="••••••••"
            autoComplete="current-password"
          />

          <Button
            type="submit"
            disabled={loading}
            className="mt-2 w-full"
            size="lg"
          >
            {loading ? "Signing in..." : "Sign in"}
          </Button>
        </form>

        <div className="mt-7 border-t border-[var(--color-line)] pt-5 text-center">
          <p className="text-sm text-[var(--color-slate-txt)]">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="font-semibold text-[var(--color-accent)] hover:underline"
            >
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}