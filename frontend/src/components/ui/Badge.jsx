/**
 * The recurring monospace "tag" used everywhere the UI shows a status,
 * count, version, or identifier — a small nod to how developers already
 * read git status codes, PR numbers, and terminal output. Functional,
 * not decorative: the color always maps to a real meaning below.
 */
const TONES = {
  neutral: {
    bg: "var(--color-line-soft)",
    fg: "var(--color-slate-txt)",
    border: "var(--color-line)",
  },
  accent: {
    bg: "var(--color-accent-soft)",
    fg: "var(--color-accent)",
    border: "var(--color-accent-soft)",
  },
  green: {
    bg: "var(--color-signal-green-soft)",
    fg: "var(--color-signal-green)",
    border: "var(--color-signal-green-soft)",
  },
  amber: {
    bg: "var(--color-signal-amber-soft)",
    fg: "var(--color-signal-amber)",
    border: "var(--color-signal-amber-soft)",
  },
  rose: {
    bg: "var(--color-signal-rose-soft)",
    fg: "var(--color-signal-rose)",
    border: "var(--color-signal-rose-soft)",
  },
  blue: {
    bg: "var(--color-signal-blue-soft)",
    fg: "var(--color-signal-blue)",
    border: "var(--color-signal-blue-soft)",
  },
};

export default function Badge({
  children,
  tone = "neutral",
  className = "",
}) {
  const t = TONES[tone] || TONES.neutral;

  return (
    <span
      className={
        "inline-flex items-center whitespace-nowrap rounded-[var(--radius-sm)] " +
        "border px-2 py-1 font-mono text-[0.6875rem] font-medium leading-none tracking-wide " +
        className
      }
      style={{
        background: t.bg,
        color: t.fg,
        borderColor: t.border,
      }}
    >
      {children}
    </span>
  );
}
