import { Router, Request, Response } from "express";
import fs from "fs";
import path from "path";
import csv from "csv-parser";

const router = Router();
const dataDir = path.join(__dirname, "..", "..", "data");

const csvFiles = [
  "child_level.csv",
  "placement_level.csv",
  "provider_level_updated.csv",
  "sample.csv",
];

function readCsvFile(filePath: string): Promise<Record<string, string>[]> {
  return new Promise((resolve, reject) => {
    const results: Record<string, string>[] = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (data) => results.push(data))
      .on("end", () => resolve(results))
      .on("error", (err) => reject(err));
  });
}

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

  const filePath = path.join(dataDir, filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: `File not found: ${filename}` });
  }

  try {
    const rows = await readCsvFile(filePath);
    res.json({ filename, rowCount: rows.length, data: rows });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({ error: `Failed to read CSV file: ${message}` });
  }
});

export default router;
