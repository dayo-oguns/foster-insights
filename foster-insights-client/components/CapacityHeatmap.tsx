import type { CapacityHeatmapRow } from "@/lib/types";

function ratioColor(ratio: number | null, max: number): string {
  if (ratio === null) return "bg-zinc-200 dark:bg-zinc-800";
  const pct = max > 0 ? ratio / max : 0;
  if (pct > 0.75) return "bg-red-500";
  if (pct > 0.5) return "bg-orange-400";
  if (pct > 0.25) return "bg-amber-300";
  return "bg-emerald-400";
}

export default function CapacityHeatmap({ data }: { data: CapacityHeatmapRow[] }) {
  const sorted = [...data].sort((a, b) => b.removalCount - a.removalCount);
  const maxRatio = Math.max(
    ...data.map((d) => d.childrenPerProvider ?? 0),
    1
  );

  return (
    <div className="overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm">
      <div className="max-h-96 overflow-y-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-zinc-50 dark:bg-zinc-900 text-left text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            <tr>
              <th className="px-4 py-2">County</th>
              <th className="px-4 py-2 text-right">Removals</th>
              <th className="px-4 py-2 text-right">Providers</th>
              <th className="px-4 py-2">Children / Provider</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-900">
            {sorted.map((row) => (
              <tr key={row.county}>
                <td className="px-4 py-2 font-medium text-zinc-900 dark:text-zinc-50">
                  {row.county}
                </td>
                <td className="px-4 py-2 text-right text-zinc-700 dark:text-zinc-300">
                  {row.removalCount}
                </td>
                <td className="px-4 py-2 text-right text-zinc-700 dark:text-zinc-300">
                  {row.providerCount}
                </td>
                <td className="px-4 py-2">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-24 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                      <div
                        className={`h-full rounded-full ${ratioColor(row.childrenPerProvider, maxRatio)}`}
                        style={{
                          width: `${
                            row.childrenPerProvider !== null
                              ? Math.min(100, (row.childrenPerProvider / maxRatio) * 100)
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                    <span className="text-xs text-zinc-600 dark:text-zinc-400">
                      {row.childrenPerProvider ?? "—"}
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
