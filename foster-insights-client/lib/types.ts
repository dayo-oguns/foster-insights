export interface CapacityHeatmapRow {
  county: string;
  removalCount: number;
  providerCount: number;
  childrenPerProvider: number | null;
}

export interface CapacityHeatmapResponse {
  generatedAt: string;
  data: CapacityHeatmapRow[];
}

export interface LengthOfStayStats {
  avgDays: number;
  medianDays: number;
  minDays: number;
  maxDays: number;
  dischargedCount: number;
  stillInCareCount: number;
}

export interface PlacementBreakdownRow {
  type: string;
  count: number;
  percentage: number;
  avgPlacementLengthDays: number;
}

export interface LengthOfStayResponse {
  generatedAt: string;
  lengthOfStay: LengthOfStayStats;
  placementBreakdown: PlacementBreakdownRow[];
}

export interface ExpiringProvider {
  id_provider: string;
  county: string;
  license_end_date: string;
  daysUntilExpiration: number;
}

export interface UnderutilizedProvider {
  id_provider: string;
  county: string;
  n_days_licensed: number | null;
  n_days_active: number | null;
  utilization: number;
}

export interface ProviderMonitorResponse {
  generatedAt: string;
  params: { expiringWithinDays: number; utilizationThreshold: number };
  summary: {
    totalProviders: number;
    expiringSoonCount: number;
    underutilizedCount: number;
    avgUtilization: number;
  };
  expiringSoon: ExpiringProvider[];
  underutilized: UnderutilizedProvider[];
}
