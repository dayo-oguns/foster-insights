import { Router, Request, Response } from "express";
import { getCsvRows } from "../utils/csv";
import { parseDate, daysBetween, toNumber } from "../utils/dates";

const router = Router();

// GET /api/analytics/capacity-heatmap
// Maps provider density vs. child removal volume by county.
router.get("/capacity-heatmap", async (req: Request, res: Response) => {
  try {
    const [children, providers] = await Promise.all([
      getCsvRows("child_level.csv"),
      getCsvRows("provider_level_updated.csv"),
    ]);

    const removalCounts = new Map<string, number>();
    for (const row of children) {
      const county = row.removal_county?.trim();
      if (!county) continue;
      removalCounts.set(county, (removalCounts.get(county) || 0) + 1);
    }

    const providerCounts = new Map<string, number>();
    for (const row of providers) {
      const county = row.county_provider?.trim();
      if (!county) continue;
      providerCounts.set(county, (providerCounts.get(county) || 0) + 1);
    }

    const counties = new Set<string>([
      ...removalCounts.keys(),
      ...providerCounts.keys(),
    ]);

    const data = Array.from(counties)
      .map((county) => {
        const removalCount = removalCounts.get(county) || 0;
        const providerCount = providerCounts.get(county) || 0;
        return {
          county,
          removalCount,
          providerCount,
          childrenPerProvider:
            providerCount > 0
              ? Number((removalCount / providerCount).toFixed(2))
              : null,
        };
      })
      .sort((a, b) => a.county.localeCompare(b.county));

    res.json({ generatedAt: new Date().toISOString(), data });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({ error: message });
  }
});

// GET /api/analytics/length-of-stay
// Average days in care, discharge stats, and placement type breakdown.
router.get("/length-of-stay", async (req: Request, res: Response) => {
  try {
    const [children, placements] = await Promise.all([
      getCsvRows("child_level.csv"),
      getCsvRows("placement_level.csv"),
    ]);

    const daysInCare: number[] = [];
    let stillInCareCount = 0;

    for (const row of children) {
      const removal = parseDate(row.removal_date);
      const discharge = parseDate(row.discharge_date);
      if (!removal) continue;
      if (!discharge) {
        stillInCareCount++;
        continue;
      }
      const days = daysBetween(removal, discharge);
      if (days >= 0) daysInCare.push(days);
    }

    daysInCare.sort((a, b) => a - b);
    const sum = daysInCare.reduce((a, b) => a + b, 0);
    const avgDays = daysInCare.length ? sum / daysInCare.length : 0;
    const medianDays = daysInCare.length
      ? daysInCare[Math.floor(daysInCare.length / 2)]
      : 0;

    const placementTypeStats = new Map<
      string,
      { count: number; totalLength: number; lengthSamples: number }
    >();

    for (const row of placements) {
      const type = row.resource_type_on_this_placement?.trim() || "unknown";
      const length = toNumber(row.placement_length);
      const entry = placementTypeStats.get(type) || {
        count: 0,
        totalLength: 0,
        lengthSamples: 0,
      };
      entry.count++;
      if (length !== null) {
        entry.totalLength += length;
        entry.lengthSamples++;
      }
      placementTypeStats.set(type, entry);
    }

    const placementBreakdown = Array.from(placementTypeStats.entries())
      .map(([type, { count, totalLength, lengthSamples }]) => ({
        type,
        count,
        percentage: placements.length
          ? Number(((count / placements.length) * 100).toFixed(1))
          : 0,
        avgPlacementLengthDays: lengthSamples
          ? Number((totalLength / lengthSamples).toFixed(1))
          : 0,
      }))
      .sort((a, b) => b.count - a.count);

    res.json({
      generatedAt: new Date().toISOString(),
      lengthOfStay: {
        avgDays: Number(avgDays.toFixed(1)),
        medianDays,
        minDays: daysInCare[0] || 0,
        maxDays: daysInCare[daysInCare.length - 1] || 0,
        dischargedCount: daysInCare.length,
        stillInCareCount,
      },
      placementBreakdown,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({ error: message });
  }
});

// GET /api/analytics/provider-monitor?expiringWithinDays=90&utilizationThreshold=0.5
// Flags providers with soon-expiring licenses or low utilization.
router.get("/provider-monitor", async (req: Request, res: Response) => {
  try {
    const providers = await getCsvRows("provider_level_updated.csv");

    const expiringWithinDays = Number(req.query.expiringWithinDays) || 90;
    const utilizationThreshold =
      req.query.utilizationThreshold !== undefined
        ? Number(req.query.utilizationThreshold)
        : 0.5;

    const today = new Date();

    interface ExpiringProvider {
      id_provider: string;
      county: string;
      license_end_date: string;
      daysUntilExpiration: number;
    }
    interface UnderutilizedProvider {
      id_provider: string;
      county: string;
      n_days_licensed: number | null;
      n_days_active: number | null;
      utilization: number;
    }

    const expiringSoon: ExpiringProvider[] = [];
    const underutilized: UnderutilizedProvider[] = [];

    let totalUtilizationSum = 0;
    let utilizationCount = 0;

    for (const row of providers) {
      const id = row.id_provider;
      const county = row.county_provider;
      const endDate = parseDate(row.license_end_date);
      const daysLicensed = toNumber(row.n_days_licensed);
      const daysActive = toNumber(row.n_days_active);

      const utilization =
        daysLicensed && daysLicensed > 0 && daysActive !== null
          ? daysActive / daysLicensed
          : null;

      if (utilization !== null) {
        totalUtilizationSum += utilization;
        utilizationCount++;
      }

      if (endDate) {
        const daysUntilExpiration = daysBetween(today, endDate);
        if (daysUntilExpiration >= 0 && daysUntilExpiration <= expiringWithinDays) {
          expiringSoon.push({
            id_provider: id,
            county,
            license_end_date: row.license_end_date,
            daysUntilExpiration,
          });
        }
      }

      if (utilization !== null && utilization < utilizationThreshold) {
        underutilized.push({
          id_provider: id,
          county,
          n_days_licensed: daysLicensed,
          n_days_active: daysActive,
          utilization: Number(utilization.toFixed(2)),
        });
      }
    }

    expiringSoon.sort((a, b) => a.daysUntilExpiration - b.daysUntilExpiration);
    underutilized.sort((a, b) => a.utilization - b.utilization);

    res.json({
      generatedAt: new Date().toISOString(),
      params: { expiringWithinDays, utilizationThreshold },
      summary: {
        totalProviders: providers.length,
        expiringSoonCount: expiringSoon.length,
        underutilizedCount: underutilized.length,
        avgUtilization: utilizationCount
          ? Number((totalUtilizationSum / utilizationCount).toFixed(2))
          : 0,
      },
      expiringSoon,
      underutilized,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({ error: message });
  }
});

export default router;
