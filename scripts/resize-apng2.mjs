// resize-apng2.mjs — Resize animated PNG to 128×128 preserving palette
// Extracts palette indices, nearest-neighbor downsamples, keeps palette
import { readFileSync, writeFileSync } from "fs";
import { inflateSync, deflateSync } from "zlib";

function crc32(buf) {
  let crc = 0xffffffff;
  const table = new Int32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[i] = c;
  }
  for (let i = 0; i < buf.length; i++) crc = table[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function parseChunks(data) {
  const chunks = [];
  let pos = 8;
  while (pos < data.length) {
    const len = data.readUInt32BE(pos);
    const type = data.toString("ascii", pos + 4, pos + 8);
    const chunkData = data.slice(pos + 8, pos + 8 + len);
    chunks.push({ type, len, data: chunkData });
    pos += 12 + len;
  }
  return chunks;
}

function defilterScanlines(raw, width, height, bpp) {
  const stride = 1 + width * bpp;
  const result = Buffer.alloc(width * height * bpp);
  const prev = Buffer.alloc(width * bpp, 0);
  for (let y = 0; y < height; y++) {
    const filter = raw[y * stride];
    const src = raw.slice(y * stride + 1, (y + 1) * stride);
    for (let i = 0; i < width * bpp; i++) {
      const left = i >= bpp ? result[y * width * bpp + i - bpp] : 0;
      const up = prev[i];
      const upperLeft = i >= bpp ? prev[i - bpp] : 0;
      let val = src[i];
      switch (filter) {
        case 0: break;
        case 1: val = (val + left) & 0xff; break;
        case 2: val = (val + up) & 0xff; break;
        case 3: val = (val + ((left + up) >> 1)) & 0xff; break;
        case 4: {
          const p = left + up - upperLeft;
          const pa = Math.abs(p - left);
          const pb = Math.abs(p - up);
          const pc = Math.abs(p - upperLeft);
          val = (val + (pa <= pb && pa <= pc ? left : pb <= pc ? up : upperLeft)) & 0xff;
          break;
        }
      }
      result[y * width * bpp + i] = val;
      prev[i] = val;
    }
  }
  return result;
}

function filterScanlines(pixels, width, height, bpp) {
  // Use Sub filter (1) for each scanline — simple and works well
  const stride = 1 + width * bpp;
  const result = Buffer.alloc(height * stride);
  for (let y = 0; y < height; y++) {
    result[y * stride] = 1; // Sub filter
    for (let i = 0; i < width * bpp; i++) {
      const cur = pixels[y * width * bpp + i];
      const left = i >= bpp ? pixels[y * width * bpp + i - bpp] : 0;
      result[y * stride + 1 + i] = (cur - left) & 0xff;
    }
  }
  return result;
}

async function main() {
  const input = process.argv[2];
  const output = process.argv[3] || input.replace(/\.png$/, "-128.png");

  const buf = readFileSync(input);
  const chunks = parseChunks(buf);

  const ihdr = chunks.find(c => c.type === "IHDR");
  const srcW = ihdr.data.readUInt32BE(0);
  const srcH = ihdr.data.readUInt32BE(4);
  const bitDepth = ihdr.data.readUInt8(8);
  const colorType = ihdr.data.readUInt8(9);
  console.log(`Source: ${srcW}x${srcH} bit_depth=${bitDepth} color_type=${colorType}`);

  // Palette
  const plte = chunks.find(c => c.type === "PLTE");
  const trns = chunks.find(c => c.type === "tRNS");
  if (!plte) { console.error("No PLTE"); process.exit(1); }

  const actl = chunks.find(c => c.type === "acTL");
  if (!actl) { console.error("Not animated"); process.exit(1); }
  const numFrames = actl.data.readUInt32BE(0);
  const numPlays = actl.data.readUInt32BE(4);
  console.log(`Frames: ${numFrames}, plays: ${numPlays}`);

  const fcTLs = chunks.filter(c => c.type === "fcTL");
  const idatChunks = chunks.filter(c => c.type === "IDAT");
  const fdatChunks = chunks.filter(c => c.type === "fdAT");

  // Decompress frame 0
  const idatRaw = inflateSync(Buffer.concat(idatChunks.map(c => c.data)));
  const frame0Pixels = defilterScanlines(idatRaw, srcW, srcH, 1);

  const TARGET_W = 128;
  const TARGET_H = 128;

  // Nearest-neighbor downsample: take every other pixel
  function downsampleIndices(pixels, w, h, tw, th) {
    const ratioW = w / tw;
    const ratioH = h / th;
    const result = Buffer.alloc(tw * th);
    for (let y = 0; y < th; y++) {
      for (let x = 0; x < tw; x++) {
        const sx = Math.floor(x * ratioW);
        const sy = Math.floor(y * ratioH);
        result[y * tw + x] = pixels[sy * w + sx];
      }
    }
    return result;
  }

  const frames = [];

  // Frame 0
  const fcTL0 = fcTLs[0];
  const delayNum = fcTL0 ? fcTL0.data.readUInt16BE(20) : 10;
  const delayDen = fcTL0 ? fcTL0.data.readUInt16BE(22) : 10;
  const disposeOp = fcTL0 ? fcTL0.data.readUInt8(24) : 0;
  const blendOp = fcTL0 ? fcTL0.data.readUInt8(25) : 0;

  frames.push({
    pixels: downsampleIndices(frame0Pixels, srcW, srcH, TARGET_W, TARGET_H),
    delayNum, delayDen, disposeOp, blendOp
  });
  console.log("Frame 0 downsized");

  // Frames 1+
  for (let i = 0; i < numFrames - 1; i++) {
    const fcTL = fcTLs[i + 1];
    const fw = fcTL.data.readUInt32BE(4);
    const fh = fcTL.data.readUInt32BE(8);
    const fx = fcTL.data.readUInt32BE(12);
    const fy = fcTL.data.readUInt32BE(16);
    const fdelayNum = fcTL.data.readUInt16BE(20);
    const fdelayDen = fcTL.data.readUInt16BE(22);
    const fdisposeOp = fcTL.data.readUInt8(24);
    const fblendOp = fcTL.data.readUInt8(25);

    const fdatData = fdatChunks[i].data.slice(4);
    const fdatRaw = inflateSync(fdatData);
    const framePixels = defilterScanlines(fdatRaw, fw, fh, 1);

    // Place frame region in full canvas
    const full = Buffer.alloc(srcW * srcH, 0);
    for (let row = 0; row < fh; row++) {
      for (let col = 0; col < fw; col++) {
        if (row + fy < srcH && col + fx < srcW) {
          full[(row + fy) * srcW + (col + fx)] = framePixels[row * fw + col];
        }
      }
    }

    frames.push({
      pixels: downsampleIndices(full, srcW, srcH, TARGET_W, TARGET_H),
      delayNum: fdelayNum, delayDen: fdelayDen, disposeOp: fdisposeOp, blendOp: fblendOp
    });
    if ((i + 1) % 10 === 0) console.log(`Frame ${i + 1} downsized`);
  }
  console.log(`All ${numFrames} frames downsized to ${TARGET_W}x${TARGET_H}`);

  // ---- Mux APNG ----
  console.log("Muxing APNG...");

  const outChunks = [];

  // IHDR
  const ihdrBuf = Buffer.alloc(13);
  ihdrBuf.writeUInt32BE(TARGET_W, 0);
  ihdrBuf.writeUInt32BE(TARGET_H, 4);
  ihdrBuf.writeUInt8(bitDepth, 8);
  ihdrBuf.writeUInt8(colorType, 9);
  ihdrBuf.writeUInt8(0, 10);
  ihdrBuf.writeUInt8(0, 11);
  ihdrBuf.writeUInt8(0, 12);
  outChunks.push({ type: "IHDR", data: ihdrBuf });

  // PLTE (pass through)
  outChunks.push({ type: "PLTE", data: plte.data });
  if (trns) outChunks.push({ type: "tRNS", data: trns.data });

  // acTL
  const actlBuf = Buffer.alloc(8);
  actlBuf.writeUInt32BE(numFrames, 0);
  actlBuf.writeUInt32BE(numPlays, 4);
  outChunks.push({ type: "acTL", data: actlBuf });

  // For each frame: fcTL + frame data (IDAT for frame 0, fdAT for rest)
  for (let i = 0; i < frames.length; i++) {
    const f = frames[i];
    const filtered = filterScanlines(f.pixels, TARGET_W, TARGET_H, 1);
    const compressed = deflateSync(filtered, { level: 9 });

    // fcTL
    const fctlBuf = Buffer.alloc(26);
    fctlBuf.writeUInt32BE(i, 0);
    fctlBuf.writeUInt32BE(TARGET_W, 4);
    fctlBuf.writeUInt32BE(TARGET_H, 8);
    fctlBuf.writeUInt32BE(0, 12);
    fctlBuf.writeUInt32BE(0, 16);
    fctlBuf.writeUInt16BE(f.delayNum, 20);
    fctlBuf.writeUInt16BE(f.delayDen, 22);
    fctlBuf.writeUInt8(f.disposeOp, 24);
    fctlBuf.writeUInt8(f.blendOp, 25);
    outChunks.push({ type: "fcTL", data: fctlBuf });

    if (i === 0) {
      outChunks.push({ type: "IDAT", data: compressed });
    } else {
      const fdatOut = Buffer.alloc(4 + compressed.length);
      fdatOut.writeUInt32BE(i, 0);
      compressed.copy(fdatOut, 4);
      outChunks.push({ type: "fdAT", data: fdatOut });
    }
  }

  // IEND
  outChunks.push({ type: "IEND", data: Buffer.alloc(0) });

  // Build output
  const pieces = [Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A])];
  for (const chunk of outChunks) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(chunk.data.length);
    const type = Buffer.from(chunk.type, "ascii");
    const crcInput = Buffer.concat([type, chunk.data]);
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(crc32(crcInput));
    pieces.push(len, type, chunk.data, crc);
  }
  const finalBuf = Buffer.concat(pieces);
  writeFileSync(output, finalBuf);
  console.log(`Wrote ${output} (${finalBuf.length} bytes, ${numFrames} frames, ${(finalBuf.length / 1024).toFixed(1)} KB)`);
}

main().catch(console.error);