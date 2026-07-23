declare module 'csv-parser' {
  import { Transform } from 'stream';

  interface CsvParserOptions {
    headers?: string[] | boolean;
    skipLines?: number;
    strict?: boolean;
    separator?: string;
    mapValues?: (item: { header: string; index: number; value: string }) => unknown;
    newline?: string;
    quote?: string;
    escape?: string;
  }

  function csvParser(options?: CsvParserOptions): Transform & NodeJS.WritableStream;

  export = csvParser;
}
