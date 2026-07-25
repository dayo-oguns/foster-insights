interface StatCardProps {
  label: string;
  value: string | number;
  sublabel?: string;
  tone?: "default" | "warning" | "danger" | "success";
}

const toneStyles: Record<NonNullable<StatCardProps["tone"]>, string> = {
  default: "border-zinc-200 dark:border-zinc-800",
  warning: "border-amber-300 dark:border-amber-700",
  danger: "border-red-300 dark:border-red-700",
  success: "border-emerald-300 dark:border-emerald-700",
};

const valueTone: Record<NonNullable<StatCardProps["tone"]>, string> = {
  default: "text-zinc-900 dark:text-zinc-50",
  warning: "text-amber-600 dark:text-amber-400",
  danger: "text-red-600 dark:text-red-400",
  success: "text-emerald-600 dark:text-emerald-400",
};

export default function StatCard({
  label,
  value,
  sublabel,
  tone = "default",
}: StatCardProps) {
  return (
    <div
      className={`rounded-xl border bg-white dark:bg-zinc-950 p-4 shadow-sm ${toneStyles[tone]}`}
    >
      <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
        {label}
      </p>
      <p className={`mt-1 text-2xl font-semibold ${valueTone[tone]}`}>
        {value}
      </p>
      {sublabel && (
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
          {sublabel}
        </p>
      )}
    </div>
  );
}
