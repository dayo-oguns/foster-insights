import { Router, Request, Response } from "express";
import { getCsvRows, csvFileExists } from "../utils/csv";

const router = Router();

const csvFiles = [
  "child_level.csv",
  "placement_level.csv",
  "provider_level_updated.csv",
];

// GET /api/csv — list available CSV files
router.get("/", (req: Request, res: Response) => {
  res.json({ files: csvFiles });
});

// GET /api/csv/:filename — return parsed content of a specific CSV file
router.get("/:filename", async (req: Request, res: Response) => {
  const filename = req.params.filename as string;

  if (!csvFiles.includes(filename)) {
    return res.status(404).json({ error: `Unknown CSV file: ${filename}` });
  }

  if (!csvFileExists(filename)) {
    return res.status(404).json({ error: `File not found: ${filename}` });
  }

  try {
    const rows = await getCsvRows(filename);
    res.json({ filename, rowCount: rows.length, data: rows });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({ error: `Failed to read CSV file: ${message}` });
  }
});

export default router;
