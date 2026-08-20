import { forwardRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

const Input = forwardRef(
  function Input(
    {
      label,
      error,
      type,
      className = "",
      ...props
    },
    ref
  ) {
    const [showPassword, setShowPassword] = useState(false);

    const isPasswordField = type === "password";
    const resolvedType = isPasswordField && showPassword ? "text" : type;

    return (
      <label className="block">
        {label && (
          <span className="mb-1.5 block text-sm font-medium text-[var(--color-ink)]">
            {label}
          </span>
        )}

        <div className="relative">
          <input
            ref={ref}
            type={resolvedType}
            className={
              "w-full rounded-[var(--radius-md)] border border-[var(--color-line)] " +
              "bg-[var(--color-surface)] px-3.5 py-2.5 text-sm text-[var(--color-ink)] " +
              "placeholder:text-[var(--color-slate-faint)] outline-none " +
              "transition-colors duration-150 " +
              "focus:border-[var(--color-accent)] " +
              (isPasswordField ? "pr-10 " : "") +
              (error
                ? "border-[var(--color-signal-rose)] "
                : "") +
              className
            }
            {...props}
          />

          {isPasswordField && (
            <button
              type="button"
              onClick={() => setShowPassword((previous) => !previous)}
              tabIndex={-1}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute inset-y-0 right-0 flex items-center px-3 text-[var(--color-slate-faint)] transition-colors duration-150 hover:text-[var(--color-slate-txt)]"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          )}
        </div>

        {error && (
          <span className="mt-1.5 block text-xs font-medium text-[var(--color-signal-rose)]">
            {error}
          </span>
        )}
      </label>
    );
  }
);

export default Input;