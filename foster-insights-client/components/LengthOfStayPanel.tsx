import type { LengthOfStayResponse } from "@/lib/types";
import StatCard from "./StatCard";

const typeColors: Record<string, string> = {
  kin: "bg-emerald-400",
  foster_home: "bg-sky-400",
  unknown: "bg-zinc-400",
};

function colorForType(type: string, index: number): string {
  if (typeColors[type]) return typeColors[type];
  const palette = ["bg-violet-400", "bg-fuchsia-400", "bg-amber-400", "bg-rose-400"];
  return palette[index % palette.length];
}

function formatLabel(type: string): string {
  return type
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export default function LengthOfStayPanel({
  data,
}: {
  data: LengthOfStayResponse;
}) {
  const { lengthOfStay, placementBreakdown } = data;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <StatCard label="Avg Days in Care" value={lengthOfStay.avgDays} />
        <StatCard label="Median Days" value={lengthOfStay.medianDays} />
        <StatCard label="Min Days" value={lengthOfStay.minDays} />
        <StatCard label="Max Days" value={lengthOfStay.maxDays} />
        <StatCard label="Discharged" value={lengthOfStay.dischargedCount} />
        <StatCard
          label="Still In Care"
          value={lengthOfStay.stillInCareCount}
          tone="warning"
        />
      </div>

      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-4 shadow-sm">
        <p className="mb-3 text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          Placement Type Breakdown
        </p>
        <div className="space-y-3">
          {placementBreakdown.map((row, i) => (
            <div key={row.type}>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="font-medium text-zinc-800 dark:text-zinc-200">
                  {formatLabel(row.type)}
                </span>
                <span className="text-zinc-500 dark:text-zinc-400">
                  {row.count} placements · {row.percentage}% · avg{" "}
                  {row.avgPlacementLengthDays}d
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                <div
                  className={`h-full rounded-full ${colorForType(row.type, i)}`}
                  style={{ width: `${row.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
