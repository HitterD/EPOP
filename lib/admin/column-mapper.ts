/**
 * Column Mapper for CSV/Excel Import
 * 
 * Auto-detects delimiter and maps CSV columns to user fields
 */

export type Delimiter = ',' | '\t' | ';' | '|';

export interface CsvColumn {
  index: number;
  header: string;
  sample: string[];
}

export interface FieldMapping {
  csvColumn: string;
  userField: string;
}

export interface ParsedCsv {
  delimiter: Delimiter;
  headers: string[];
  columns: CsvColumn[];
  rows: string[][];
}

/**
 * Auto-detect CSV delimiter
 */
export function detectDelimiter(csvContent: string): Delimiter {
  const firstLine = csvContent.split('\n')[0];
  
  const delimiters: Delimiter[] = [',', '\t', ';', '|'];
  const counts = delimiters.map((delimiter) => ({
    delimiter,
    count: firstLine.split(delimiter).length,
  }));

  // Sort by count descending
  counts.sort((a, b) => b.count - a.count);

  return counts[0].delimiter;
}

/**
 * Parse CSV content
 */
export function parseCsv(csvContent: string, delimiter?: Delimiter): ParsedCsv {
  const detectedDelimiter = delimiter || detectDelimiter(csvContent);
  const lines = csvContent.trim().split('\n');
  
  if (lines.length === 0) {
    throw new Error('CSV is empty');
  }

  // Parse headers
  const headers = lines[0].split(detectedDelimiter).map((h) => h.trim());

  // Parse rows
  const rows = lines.slice(1).map((line) =>
    line.split(detectedDelimiter).map((cell) => cell.trim())
  );

  // Create column objects with samples
  const columns: CsvColumn[] = headers.map((header, index) => ({
    index,
    header,
    sample: rows.slice(0, 3).map((row) => row[index] || ''),
  }));

  return {
    delimiter: detectedDelimiter,
    headers,
    columns,
    rows,
  };
}

/**
 * Auto-map CSV columns to user fields
 */
export function autoMapColumns(
  csvColumns: CsvColumn[],
  userFields: string[]
): FieldMapping[] {
  const mappings: FieldMapping[] = [];

  csvColumns.forEach((column) => {
    const normalized = normalizeFieldName(column.header);
    const match = userFields.find((field) =>
      normalizeFieldName(field) === normalized
    );

    if (match) {
      mappings.push({
        csvColumn: column.header,
        userField: match,
      });
    }
  });

  return mappings;
}

/**
 * Normalize field name for comparison
 */
function normalizeFieldName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .replace(/\s+/g, '');
}

/**
 * Validate mapping
 */
export function validateMapping(
  mappings: FieldMapping[],
  requiredFields: string[]
): { valid: boolean; missingFields: string[] } {
  const mappedFields = mappings.map((m) => m.userField);
  const missingFields = requiredFields.filter(
    (field) => !mappedFields.includes(field)
  );

  return {
    valid: missingFields.length === 0,
    missingFields,
  };
}

/**
 * Transform CSV row to user object
 */
export function transformRow(
  row: string[],
  mappings: FieldMapping[],
  csvHeaders: string[]
): Record<string, string> {
  const result: Record<string, string> = {};

  mappings.forEach((mapping) => {
    const columnIndex = csvHeaders.indexOf(mapping.csvColumn);
    if (columnIndex !== -1) {
      result[mapping.userField] = row[columnIndex] || '';
    }
  });

  return result;
}

/**
 * Generate dry-run summary
 */
export function generateDryRun(
  rows: string[][],
  mappings: FieldMapping[],
  csvHeaders: string[]
): {
  totalRows: number;
  validRows: number;
  invalidRows: number;
  errors: Array<{ row: number; error: string }>;
  preview: Array<Record<string, string>>;
} {
  const errors: Array<{ row: number; error: string }> = [];
  const preview: Array<Record<string, string>> = [];
  let validRows = 0;

  rows.forEach((row, index) => {
    try {
      const transformed = transformRow(row, mappings, csvHeaders);
      
      // Validate required fields
      const hasAllFields = Object.values(transformed).every((v) => v.length > 0);
      
      if (hasAllFields) {
        validRows++;
        if (preview.length < 5) {
          preview.push(transformed);
        }
      } else {
        errors.push({
          row: index + 2, // +2 for header and 0-index
          error: 'Missing required fields',
        });
      }
    } catch (error) {
      errors.push({
        row: index + 2,
        error: error.message,
      });
    }
  });

  return {
    totalRows: rows.length,
    validRows,
    invalidRows: rows.length - validRows,
    errors,
    preview,
  };
}

/**
 * React hook for column mapping
 */
export function useColumnMapper(csvContent: string) {
  const [parsed, setParsed] = React.useState<ParsedCsv | null>(null);
  const [mappings, setMappings] = React.useState<FieldMapping[]>([]);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!csvContent) return;

    try {
      const result = parseCsv(csvContent);
      setParsed(result);
      setError(null);
    } catch (err) {
      setError(err.message);
      setParsed(null);
    }
  }, [csvContent]);

  const autoMap = React.useCallback((userFields: string[]) => {
    if (!parsed) return;
    const auto = autoMapColumns(parsed.columns, userFields);
    setMappings(auto);
  }, [parsed]);

  const updateMapping = React.useCallback((csvColumn: string, userField: string) => {
    setMappings((prev) => {
      const existing = prev.find((m) => m.csvColumn === csvColumn);
      if (existing) {
        return prev.map((m) =>
          m.csvColumn === csvColumn ? { ...m, userField } : m
        );
      }
      return [...prev, { csvColumn, userField }];
    });
  }, []);

  const removeMapping = React.useCallback((csvColumn: string) => {
    setMappings((prev) => prev.filter((m) => m.csvColumn !== csvColumn));
  }, []);

  const getDryRun = React.useCallback(() => {
    if (!parsed) return null;
    return generateDryRun(parsed.rows, mappings, parsed.headers);
  }, [parsed, mappings]);

  return {
    parsed,
    mappings,
    error,
    autoMap,
    updateMapping,
    removeMapping,
    getDryRun,
  };
}

// React import
import React from 'react';
