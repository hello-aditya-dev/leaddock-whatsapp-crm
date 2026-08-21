/**
 * csv.js — RFC-4180-ish CSV parsing and serializing.
 *
 * Handles quoted fields, escaped double quotes, CRLF/LF, and trailing newlines.
 * No external dependencies.
 */

/**
 * Parse a CSV string into an array of row objects using the first row as header.
 * @param {string} text
 * @returns {{ rows: Array<Record<string,string>>, errors: Array<{row:number,message:string}> }}
 */
export function parseCsv(text) {
  const out = { rows: [], errors: [] };
  if (typeof text !== "string" || text.length === 0) return out;

  const records = parseRecords(text);
  if (records.length === 0) return out;

  const header = records[0].map((h) => String(h == null ? "" : h).trim());
  if (header.length === 0 || header.every((h) => h === "")) {
    out.errors.push({ row: 1, message: "Missing header row" });
    return out;
  }

  for (let i = 1; i < records.length; i++) {
    const rec = records[i];
    if (rec.length === 1 && rec[0] === "") continue; // skip blank lines
    const obj = {};
    for (let c = 0; c < header.length; c++) {
      obj[header[c]] = rec[c] == null ? "" : String(rec[c]);
    }
    out.rows.push(obj);
  }
  return out;
}

/**
 * Parse CSV text into an array of string arrays (records).
 * Honors quoted fields and "" escape.
 * @param {string} text
 * @returns {string[][]}
 */
export function parseRecords(text) {
  const records = [];
  let field = "";
  let row = [];
  let i = 0;
  let inQuotes = false;
  const n = text.length;

  // Normalize: keep CR/LF handling inside loop.
  while (i < n) {
    const ch = text[i];

    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i += 2;
          continue;
        }
        inQuotes = false;
        i++;
        continue;
      }
      field += ch;
      i++;
      continue;
    }

    if (ch === '"') {
      inQuotes = true;
      i++;
      continue;
    }

    if (ch === ",") {
      row.push(field);
      field = "";
      i++;
      continue;
    }

    if (ch === "\r") {
      // handle CRLF or lone CR
      row.push(field);
      field = "";
      records.push(row);
      row = [];
      if (text[i + 1] === "\n") i += 2;
      else i++;
      continue;
    }

    if (ch === "\n") {
      row.push(field);
      field = "";
      records.push(row);
      row = [];
      i++;
      continue;
    }

    field += ch;
    i++;
  }

  // flush trailing field/row if any content remains
  if (field !== "" || row.length > 0) {
    row.push(field);
    records.push(row);
  }

  return records;
}

/**
 * Quote a single CSV field per RFC-4180: wrap in quotes if it contains
 * comma, quote, newline, or carriage return; escape embedded quotes by doubling.
 * @param {string|number|boolean|null} value
 * @returns {string}
 */
export function quoteField(value) {
  if (value === null || value === undefined) return "";
  const s = String(value);
  if (/[",\r\n]/.test(s)) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

/**
 * Serialize an array of objects into CSV using the given column order.
 * @param {Array<Record<string,any>>} rows
 * @param {string[]} columns
 * @returns {string}
 */
export function toCsv(rows, columns) {
  const cols = Array.isArray(columns) ? columns : [];
  const header = cols.map(quoteField).join(",");
  const body = (rows || [])
    .map((r) => cols.map((c) => quoteField(r ? r[c] : "")).join(","))
    .join("\r\n");
  return [header, body].filter(Boolean).join("\r\n") + "\r\n";
}

/**
 * Build a CSV template (header + one example row) for downloads.
 * @param {string[]} columns
 * @param {Record<string,string>} example
 * @returns {string}
 */
export function template(columns, example = {}) {
  const header = columns.map(quoteField).join(",");
  const sample = columns.map((c) => quoteField(example[c] || "")).join(",");
  return header + "\r\n" + sample + "\r\n";
}

export default { parseCsv, parseRecords, quoteField, toCsv, template };
