/**
 * scripts/gen-icons.js — generate simple PNG icons for the extension.
 *
 * Produces solid teal icons with a "WF" mark at 16/32/48/128 px. Uses only
 * Node built-ins (zlib) to encode valid PNGs — no native deps.
 *
 * Run with: node scripts/gen-icons.js
 * Replace assets/icons/* with your own branded icons before publishing.
 */
import { mkdirSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import zlib from "node:zlib";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const outDir = path.join(root, "assets/icons");

// Teal background + white "WF" (approximate, drawn as pixels).
const BG = [0x0f, 0x76, 0x6e]; // #0F766E
const FG = [0xff, 0xff, 0xff]; // white

function makePng(size) {
  const w = size, h = size;
  // Build RGBA pixel buffer.
  const pixels = Buffer.alloc(w * h * 4);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      // Draw a simple "WF" by painting a rounded square background and
      // carving a W+stroke pattern. For small sizes we keep it abstract.
      const inBorder = x >= 1 && y >= 1 && x < w - 1 && y < h - 1;
      const [r, g, b] = inBorder ? BG : [0, 0, 0, 0];
      pixels[i] = r;
      pixels[i + 1] = g;
      pixels[i + 2] = b;
      pixels[i + 3] = inBorder ? 255 : 0;
    }
  }
  // Add a stylized "W" using simple block geometry scaled to size.
  const stroke = Math.max(1, Math.round(size / 16));
  // Diagonal strokes of a W:
  function plot(px, py) {
    if (px < 0 || py < 0 || px >= w || py >= h) return;
    const i = (py * w + px) * 4;
    pixels[i] = FG[0]; pixels[i + 1] = FG[1]; pixels[i + 2] = FG[2]; pixels[i + 3] = 255;
  }
  function thickLine(x0, y0, x1, y1) {
    const steps = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)) * 2;
    for (let s = 0; s <= steps; s++) {
      const t = s / steps;
      const px = Math.round(x0 + (x1 - x0) * t);
      const py = Math.round(y0 + (y1 - y0) * t);
      for (let dy = -stroke; dy <= stroke; dy++) {
        for (let dx = -stroke; dx <= stroke; dx++) {
          plot(px + dx, py + dy);
        }
      }
    }
  }
  const m = Math.round(size * 0.28);
  const top = Math.round(size * 0.30);
  const bot = Math.round(size * 0.72);
  // W shape: /\/
  thickLine(m, top, Math.round(size * 0.42), bot);
  thickLine(Math.round(size * 0.42), bot, Math.round(size * 0.5), Math.round(size * 0.55));
  thickLine(Math.round(size * 0.5), Math.round(size * 0.55), Math.round(size * 0.58), bot);
  thickLine(Math.round(size * 0.58), bot, Math.round(size * 0.72), top);

  return encodePng(w, h, pixels);
}

function encodePng(w, h, rgba) {
  // PNG signature
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  function chunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const typeBuf = Buffer.from(type, "ascii");
    const crcBuf = Buffer.alloc(4);
    crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])) >>> 0, 0);
    return Buffer.concat([len, typeBuf, data, crcBuf]);
  }

  // IHDR
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8;   // bit depth
  ihdr[9] = 6;   // color type RGBA
  ihdr[10] = 0;  // compression
  ihdr[11] = 0;  // filter
  ihdr[12] = 0;  // interlace

  // IDAT: per-scanline filter byte 0 + raw RGBA
  const stride = w * 4;
  const raw = Buffer.alloc((stride + 1) * h);
  for (let y = 0; y < h; y++) {
    raw[y * (stride + 1)] = 0; // filter none
    rgba.copy(raw, y * (stride + 1) + 1, y * stride, y * stride + stride);
  }
  const idat = zlib.deflateSync(raw);

  return Buffer.concat([sig, chunk("IHDR", ihdr), chunk("IDAT", idat), chunk("IEND", Buffer.alloc(0))]);
}

const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    t[n] = c >>> 0;
  }
  return t;
})();
function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });
for (const size of [16, 32, 48, 128]) {
  const png = makePng(size);
  const fp = path.join(outDir, `icon-${size}.png`);
  writeFileSync(fp, png);
  console.log(`[gen-icons] wrote ${fp} (${png.length} bytes)`);
}
console.log("[gen-icons] done. Replace with branded icons before publishing.");
