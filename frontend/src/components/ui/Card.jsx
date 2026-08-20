export default function Card({
  children,
  className = "",
  padded = true,
  ...props
}) {
  return (
    <div
      className={
        "rounded-[var(--radius-lg)] border border-[var(--color-line)] " +
        "bg-[var(--color-surface)] shadow-[var(--shadow-sm)] " +
        (padded ? "p-5 " : "") +
        className
      }
      {...props}
    >
      {children}
    </div>
  );
}
