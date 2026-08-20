export default function StatCard({ title, value, icon: Icon, tone = "neutral" }) {
  const toneStyles = {
    neutral: "bg-[var(--color-line-soft)] text-[var(--color-slate-txt)]",
    accent: "bg-[var(--color-accent-soft)] text-[var(--color-accent)]",
    green: "bg-[var(--color-signal-green-soft)] text-[var(--color-signal-green)]",
    amber: "bg-[var(--color-signal-amber-soft)] text-[var(--color-signal-amber)]",
  };

  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--color-line)] bg-[var(--color-surface)] p-5 shadow-[var(--shadow-sm)]">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-[var(--color-slate-txt)]">
          {title}
        </p>

        {Icon && (
          <span
            className={
              "flex h-8 w-8 items-center justify-center rounded-[var(--radius-sm)] " +
              toneStyles[tone]
            }
          >
            <Icon size={15} strokeWidth={2.25} />
          </span>
        )}
      </div>

      <p className="mt-3 font-[var(--font-display)] text-3xl font-bold text-[var(--color-ink)]">
        {value ?? 0}
      </p>
    </div>
  );
}
