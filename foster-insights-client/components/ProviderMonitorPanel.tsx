"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import type { ProviderMonitorResponse } from "@/lib/types";
import StatCard from "./StatCard";

interface ProviderMonitorPanelProps {
  data: ProviderMonitorResponse;
  expiringWithinDays: number;
  utilizationThresholdPct: number;
}

export default function ProviderMonitorPanel({
  data,
  expiringWithinDays,
  utilizationThresholdPct,
}: ProviderMonitorPanelProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const expiring = formData.get("expiringWithinDays");
    const threshold = formData.get("utilizationThreshold");

    const params = new URLSearchParams(searchParams.toString());
    if (expiring) params.set("expiringWithinDays", expiring.toString());
    if (threshold) params.set("utilizationThreshold", threshold.toString());

    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="space-y-4">
      <form
        onSubmit={handleSubmit}
        className="flex flex-wrap items-end gap-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-4 shadow-sm"
      >
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Expiring within (days)
          </span>
          <input
            type="number"
            name="expiringWithinDays"
            min={1}
            defaultValue={expiringWithinDays}
            className="w-32 rounded-md border border-zinc-300 dark:border-zinc-700 bg-transparent px-2 py-1 text-zinc-900 dark:text-zinc-50"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Underutilized threshold (%)
          </span>
          <input
            type="number"
            name="utilizationThreshold"
            min={1}
            max={100}
            defaultValue={utilizationThresholdPct}
            className="w-32 rounded-md border border-zinc-300 dark:border-zinc-700 bg-transparent px-2 py-1 text-zinc-900 dark:text-zinc-50"
          />
        </label>
        <button
          type="submit"
          className="rounded-md bg-zinc-900 dark:bg-zinc-50 px-4 py-1.5 text-sm font-medium text-white dark:text-zinc-900 hover:opacity-90"
        >
          Apply
        </button>
      </form>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Total Providers" value={data.summary.totalProviders} />
        <StatCard
          label="Expiring Soon"
          value={data.summary.expiringSoonCount}
          tone={data.summary.expiringSoonCount > 0 ? "danger" : "success"}
        />
        <StatCard
          label="Underutilized"
          value={data.summary.underutilizedCount}
          tone={data.summary.underutilizedCount > 0 ? "warning" : "success"}
        />
        <StatCard
          label="Avg Utilization"
          value={`${Math.round(data.summary.avgUtilization * 100)}%`}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm overflow-hidden">
          <p className="border-b border-zinc-100 dark:border-zinc-900 px-4 py-2 text-xs font-medium uppercase tracking-wide text-red-600 dark:text-red-400">
            Licenses Expiring Soon
          </p>
          <div className="max-h-80 overflow-y-auto">
            {data.expiringSoon.length === 0 ? (
              <p className="p-4 text-sm text-zinc-500 dark:text-zinc-400">
                No providers expiring within {expiringWithinDays} days.
              </p>
            ) : (
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-zinc-50 dark:bg-zinc-900 text-left text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                  <tr>
                    <th className="px-4 py-2">Provider ID</th>
                    <th className="px-4 py-2">County</th>
                    <th className="px-4 py-2">Expires</th>
                    <th className="px-4 py-2 text-right">Days Left</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-900">
                  {data.expiringSoon.map((p) => (
                    <tr key={p.id_provider}>
                      <td className="px-4 py-2 font-medium text-zinc-900 dark:text-zinc-50">
                        {p.id_provider}
                      </td>
                      <td className="px-4 py-2 text-zinc-700 dark:text-zinc-300">
                        {p.county}
                      </td>
                      <td className="px-4 py-2 text-zinc-700 dark:text-zinc-300">
                        {p.license_end_date}
                      </td>
                      <td className="px-4 py-2 text-right font-medium text-red-600 dark:text-red-400">
                        {p.daysUntilExpiration}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm overflow-hidden">
          <p className="border-b border-zinc-100 dark:border-zinc-900 px-4 py-2 text-xs font-medium uppercase tracking-wide text-amber-600 dark:text-amber-400">
            Underutilized Providers
          </p>
          <div className="max-h-80 overflow-y-auto">
            {data.underutilized.length === 0 ? (
              <p className="p-4 text-sm text-zinc-500 dark:text-zinc-400">
                No providers below {utilizationThresholdPct}% utilization.
              </p>
            ) : (
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-zinc-50 dark:bg-zinc-900 text-left text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                  <tr>
                    <th className="px-4 py-2">Provider ID</th>
                    <th className="px-4 py-2">County</th>
                    <th className="px-4 py-2 text-right">Active / Licensed</th>
                    <th className="px-4 py-2 text-right">Utilization</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-900">
                  {data.underutilized.map((p) => (
                    <tr key={p.id_provider}>
                      <td className="px-4 py-2 font-medium text-zinc-900 dark:text-zinc-50">
                        {p.id_provider}
                      </td>
                      <td className="px-4 py-2 text-zinc-700 dark:text-zinc-300">
                        {p.county}
                      </td>
                      <td className="px-4 py-2 text-right text-zinc-700 dark:text-zinc-300">
                        {p.n_days_active ?? "—"} / {p.n_days_licensed ?? "—"}
                      </td>
                      <td className="px-4 py-2 text-right font-medium text-amber-600 dark:text-amber-400">
                        {Math.round(p.utilization * 100)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
