import {
  fetchCapacityHeatmap,
  fetchLengthOfStay,
  fetchProviderMonitor,
  getServerApiUrl,
} from "@/lib/api";
import CapacityHeatmap from "@/components/CapacityHeatmap";
import LengthOfStayPanel from "@/components/LengthOfStayPanel";
import ProviderMonitorPanel from "@/components/ProviderMonitorPanel";
import SectionHeading from "@/components/SectionHeading";

interface HomeProps {
  searchParams: Promise<{
    expiringWithinDays?: string;
    utilizationThreshold?: string;
  }>;
}

export default async function Home({ searchParams }: HomeProps) {
  const params = await searchParams;
  const expiringWithinDays = Number(params.expiringWithinDays) || 90;
  const utilizationThresholdPct = Number(params.utilizationThreshold) || 50;

  const baseUrl = getServerApiUrl();

  const [heatmap, lengthOfStay, providerMonitor] = await Promise.all([
    fetchCapacityHeatmap(baseUrl),
    fetchLengthOfStay(baseUrl),
    fetchProviderMonitor(
      baseUrl,
      expiringWithinDays,
      utilizationThresholdPct / 100,
    ),
  ]);

  return (
    <div className="flex flex-1 flex-col bg-zinc-50 dark:bg-black">
      <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-6 py-6 sm:px-10">
        <p className="text-xs font-semibold uppercase tracking-wider text-sky-600 dark:text-sky-400">
          DCFS Executive & Regional Operations Dashboard
        </p>
        <h1 className="mt-1 text-2xl font-bold text-zinc-900 dark:text-zinc-50">
          System Performance &amp; Foster Care Stability
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Empower better outcomes through data
        </p>
      </header>

      <main className="flex-1 space-y-10 px-6 py-8 sm:px-10">
        <section>
          <SectionHeading
            title="System Capacity Heatmap"
            description="Provider density vs. child removal volume by county."
          />
          <CapacityHeatmap data={heatmap.data} />
        </section>

        <section>
          <SectionHeading
            title="Length of Stay & Discharge Analytics"
            description="Average days in care, time to discharge, and placement type breakdown."
          />
          <LengthOfStayPanel data={lengthOfStay} />
        </section>

        <section>
          <SectionHeading
            title="Provider Capacity & Expiration Monitor"
            description="Alerts for licenses expiring soon and providers that are underutilized."
          />
          <ProviderMonitorPanel
            data={providerMonitor}
            expiringWithinDays={expiringWithinDays}
            utilizationThresholdPct={utilizationThresholdPct}
          />
        </section>
      </main>
    </div>
  );
}
