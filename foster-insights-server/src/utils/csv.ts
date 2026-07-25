import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';

export const dataDir = path.join(__dirname, '..', '..', 'data');

interface CacheEntry {
  mtimeMs: number;
  rows: Record<string, string>[];
}

const cache = new Map<string, CacheEntry>();

function readCsvFileRaw(filePath: string): Promise<Record<string, string>[]> {
  return new Promise((resolve, reject) => {
    const results: Record<string, string>[] = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', (err) => reject(err));
  });
}

/**
 * Reads and parses a CSV file from the data directory, caching the parsed
 * rows in memory until the underlying file's mtime changes.
 */
export async function getCsvRows(filename: string): Promise<Record<string, string>[]> {
  const filePath = path.join(dataDir, filename);
  const stat = fs.statSync(filePath);
  const cached = cache.get(filename);

  if (cached && cached.mtimeMs === stat.mtimeMs) {
    return cached.rows;
  }

  const rows = await readCsvFileRaw(filePath);
  cache.set(filename, { mtimeMs: stat.mtimeMs, rows });
  return rows;
}

export function csvFileExists(filename: string): boolean {
  return fs.existsSync(path.join(dataDir, filename));
}
