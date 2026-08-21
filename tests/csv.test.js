/**
 * tests/csv.test.js — CSV parse + serialize round trip + template.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { parseCsv, parseRecords, quoteField, toCsv, template } from "../src/content/utils/csv.js";

test("quoteField quotes fields with commas", () => {
  assert.equal(quoteField("a,b"), '"a,b"');
  assert.equal(quoteField("plain"), "plain");
  assert.equal(quoteField('has "quote"'), '"has ""quote"""');
  assert.equal(quoteField("multi\nline"), '"multi\nline"');
  assert.equal(quoteField(null), "");
  assert.equal(quoteField(42), "42");
});

test("parseRecords handles quoted fields + escaped quotes", () => {
  const recs = parseRecords('a,b,c\r\n"q1","q2,with comma","q3 ""quoted"""\r\n');
  assert.deepEqual(recs, [["a", "b", "c"], ["q1", "q2,with comma", 'q3 "quoted"']]);
});

test("parseRecords handles LF-only endings", () => {
  const recs = parseRecords("x,y\n1,2\n");
  assert.deepEqual(recs, [["x", "y"], ["1", "2"]]);
});

test("parseCsv maps first row to header", () => {
  const { rows, errors } = parseCsv("name,phone\nAlice,+1\nBob,+2\n");
  assert.equal(errors.length, 0);
  assert.equal(rows.length, 2);
  assert.equal(rows[0].name, "Alice");
  assert.equal(rows[1].phone, "+2");
});

test("toCsv round-trips with parseCsv", () => {
  const cols = ["name", "phone", "note"];
  const rows = [
    { name: "Alice", phone: "+1", note: "hello, world" },
    { name: "Bob", phone: "+2", note: 'has "quotes"' },
  ];
  const csv = toCsv(rows, cols);
  const parsed = parseCsv(csv);
  assert.equal(parsed.rows.length, 2);
  assert.equal(parsed.rows[0].note, "hello, world");
  assert.equal(parsed.rows[1].note, 'has "quotes"');
});

test("template produces header + sample row", () => {
  const t = template(["a", "b"], { a: "1", b: "2" });
  assert.equal(t, "a,b\r\n1,2\r\n");
});

test("parseCsv handles empty input", () => {
  const r = parseCsv("");
  assert.equal(r.rows.length, 0);
  assert.equal(r.errors.length, 0);
});
