import type {
  CapacityHeatmapResponse,
  LengthOfStayResponse,
  ProviderMonitorResponse,
} from "./types";

export function getServerApiUrl(): string {
  return process.env.API_URL || "http://localhost:3001";
}

export async function fetchCapacityHeatmap(
  baseUrl: string,
): Promise<CapacityHeatmapResponse> {
  const res = await fetch(`${baseUrl}/api/analytics/capacity-heatmap`, {
    cache: "no-store",
  });
  if (!res.ok)
    throw new Error(`Failed to fetch capacity heatmap: ${res.status}`);
  return res.json();
}

export async function fetchLengthOfStay(
  baseUrl: string,
): Promise<LengthOfStayResponse> {
  const res = await fetch(`${baseUrl}/api/analytics/length-of-stay`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Failed to fetch length of stay: ${res.status}`);
  return res.json();
}

export async function fetchProviderMonitor(
  baseUrl: string,
  expiringWithinDays: number,
  utilizationThreshold: number,
): Promise<ProviderMonitorResponse> {
  const url = new URL(`${baseUrl}/api/analytics/provider-monitor`);
  url.searchParams.set("expiringWithinDays", String(expiringWithinDays));
  url.searchParams.set("utilizationThreshold", String(utilizationThreshold));

  const res = await fetch(url.toString(), { cache: "no-store" });
  if (!res.ok)
    throw new Error(`Failed to fetch provider monitor: ${res.status}`);
  return res.json();
}
