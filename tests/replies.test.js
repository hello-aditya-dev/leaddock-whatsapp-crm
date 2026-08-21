/**
 * tests/replies.test.js — quick reply parser + template renderer.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { detectTrailingShortcut, matchShortcut } from "../src/content/replies/parser.js";
import { render, supported } from "../src/content/replies/renderer.js";

test("detectTrailingShortcut finds /price at end", () => {
  assert.deepEqual(detectTrailingShortcut("hello /price"), {
    shortcut: "/price", prefix: "hello ", start: 6, end: 12,
  });
});

test("detectTrailingShortcut finds shortcut at start", () => {
  const r = detectTrailingShortcut("/hi");
  assert.equal(r.shortcut, "/hi");
  assert.equal(r.prefix, "");
});

test("detectTrailingShortcut returns null when none", () => {
  assert.equal(detectTrailingShortcut("just a normal message"), null);
  assert.equal(detectTrailingShortcut(""), null);
  assert.equal(detectTrailingShortcut("price"), null); // no slash
});

test("detectTrailingShortcut does not match mid-text", () => {
  assert.equal(detectTrailingShortcut("/hi there"), null);
});

test("matchShortcut matches a known reply", () => {
  const replies = [{ shortcut: "/price", name: "Pricing" }, { shortcut: "/hi", name: "Greeting" }];
  const m = matchShortcut("Sure, /price", replies);
  assert.ok(m);
  assert.equal(m.reply.name, "Pricing");
});

test("matchShortcut is case-insensitive", () => {
  const replies = [{ shortcut: "/Price" }];
  const m = matchShortcut("hi /price", replies);
  assert.ok(m);
});

test("render replaces known variables", () => {
  const out = render("Hi {{name}}, call {{phone}} about {{product}}", {
    name: "Rahul", phone: "+910000000001", product: "Mats",
  });
  assert.equal(out, "Hi Rahul, call +910000000001 about Mats");
});

test("render leaves unknown variables visible", () => {
  const out = render("Hi {{name}} {{unknownvar}}", { name: "Rahul" });
  assert.equal(out, "Hi Rahul {{unknownvar}}");
});

test("render leaves empty fields as the placeholder", () => {
  const out = render("Company: {{company}}", { name: "X" });
  assert.equal(out, "Company: {{company}}");
});

test("supported() lists the four supported variables", () => {
  assert.deepEqual(supported().sort(), ["company", "name", "phone", "product"]);
});
