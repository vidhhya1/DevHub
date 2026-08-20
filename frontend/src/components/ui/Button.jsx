export default function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  ...props
}) {
  const base =
    "inline-flex items-center justify-center gap-2 font-medium " +
    "transition-colors duration-150 disabled:cursor-not-allowed " +
    "disabled:opacity-50 rounded-[var(--radius-md)] " +
    "focus-visible:outline-2 focus-visible:outline-offset-2";

  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-5 py-2.5 text-sm",
  };

  const variants = {
    primary:
      "bg-[var(--color-accent)] text-white shadow-[var(--shadow-xs)] " +
      "hover:bg-[var(--color-accent-hover)] " +
      "focus-visible:outline-[var(--color-accent)]",

    secondary:
      "bg-[var(--color-surface)] text-[var(--color-ink)] " +
      "border border-[var(--color-line)] shadow-[var(--shadow-xs)] " +
      "hover:bg-[var(--color-line-soft)] " +
      "focus-visible:outline-[var(--color-accent)]",

    ghost:
      "bg-transparent text-[var(--color-slate-txt)] " +
      "hover:bg-[var(--color-line-soft)] hover:text-[var(--color-ink)] " +
      "focus-visible:outline-[var(--color-accent)]",

    danger:
      "bg-[var(--color-signal-rose)] text-white shadow-[var(--shadow-xs)] " +
      "hover:bg-[#c81440] focus-visible:outline-[var(--color-signal-rose)]",

    success:
      "bg-[var(--color-signal-green)] text-white shadow-[var(--shadow-xs)] " +
      "hover:bg-[#0f9d5c] focus-visible:outline-[var(--color-signal-green)]",
  };

  return (
    <button
      className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
