// resize-apng.mjs — Resize animated PNG to 128×128 preserving all frames
// Usage: node resize-apng.mjs <input.png> [output.png]
import { readFileSync, writeFileSync } from "fs";
import { inflateSync, deflateSync } from "zlib";
import sharp from "sharp";

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
  let pos = 8; // skip PNG signature
  while (pos < data.length) {
    const len = data.readUInt32BE(pos);
    const type = data.toString("ascii", pos + 4, pos + 8);
    const chunkData = data.slice(pos + 8, pos + 8 + len);
    chunks.push({ type, len, data: chunkData, offset: pos });
    pos += 12 + len;
  }
  return chunks;
}

function defilterScanlines(raw, width, height, bpp) {
  const stride = 1 + width * bpp; // filter byte + pixel data per scanline
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
        case 0: break; // None
        case 1: val = (val + left) & 0xff; break; // Sub
        case 2: val = (val + up) & 0xff; break; // Up
        case 3: val = (val + ((left + up) >> 1)) & 0xff; break; // Average
        case 4: { // Paeth
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

async function main() {
  const input = process.argv[2];
  const output = process.argv[3] || input.replace(/\.png$/, "-128.png");

  const buf = readFileSync(input);
  const chunks = parseChunks(buf);

  // Parse header info
  const ihdr = chunks.find(c => c.type === "IHDR");
  const srcW = ihdr.data.readUInt32BE(0);
  const srcH = ihdr.data.readUInt32BE(4);
  const bitDepth = ihdr.data.readUInt8(8);
  const colorType = ihdr.data.readUInt8(9);

  console.log(`Source: ${srcW}x${srcH}, bit_depth=${bitDepth}, color_type=${colorType}`);

  // Parse palette
  const plte = chunks.find(c => c.type === "PLTE");
  const trns = chunks.find(c => c.type === "tRNS");
  const palette = [];
  if (plte) {
    for (let i = 0; i < plte.data.length; i += 3) {
      palette.push({ r: plte.data[i], g: plte.data[i + 1], b: plte.data[i + 2], a: 255 });
    }
  }
  if (trns) {
    for (let i = 0; i < trns.data.length; i++) {
      if (palette[i]) palette[i].a = trns.data[i];
    }
  }

  // Parse acTL
  const actl = chunks.find(c => c.type === "acTL");
  if (!actl) { console.error("Not an animated PNG"); process.exit(1); }
  const numFrames = actl.data.readUInt32BE(0);
  const numPlays = actl.data.readUInt32BE(4);
  console.log(`Frames: ${numFrames}, plays: ${numPlays}`);

  // Collect fcTL and frame data
  const fcTLs = chunks.filter(c => c.type === "fcTL");
  const idatChunks = chunks.filter(c => c.type === "IDAT");
  const fdatChunks = chunks.filter(c => c.type === "fdAT");

  // Decompress frame 0 (IDAT)
  console.log("Decompressing frames...");
  const idatCompressed = Buffer.concat(idatChunks.map(c => c.data));
  const idatRaw = inflateSync(idatCompressed);

  const bpp = colorType === 3 ? 1 : 4; // indexed = 1 byte/pixel, RGBA = 4
  const frame0Pixels = defilterScanlines(idatRaw, srcW, srcH, bpp);

  // Convert indexed to RGBA
  function toRGBA(indices, w, h) {
    const rgba = Buffer.alloc(w * h * 4);
    for (let i = 0; i < w * h; i++) {
      const idx = indices[i];
      const c = palette[idx] || { r: 0, g: 0, b: 0, a: 255 };
      rgba[i * 4] = c.r;
      rgba[i * 4 + 1] = c.g;
      rgba[i * 4 + 2] = c.b;
      rgba[i * 4 + 3] = c.a;
    }
    return rgba;
  }

  const frames = [];

  // Frame 0
  const fcTL0 = fcTLs[0];
  const delayNum = fcTL0 ? fcTL0.data.readUInt16BE(20) : 10;
  const delayDen = fcTL0 ? fcTL0.data.readUInt16BE(22) : 10;
  const disposeOp = fcTL0 ? fcTL0.data.readUInt8(24) : 0;
  const blendOp = fcTL0 ? fcTL0.data.readUInt8(25) : 0;

  const frame0RGBA = toRGBA(frame0Pixels, srcW, srcH);
  const png0 = await sharp(frame0RGBA, { raw: { width: srcW, height: srcH, channels: 4 } })
    .resize(128, 128, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();
  frames.push({ png: png0, delayNum, delayDen, disposeOp, blendOp });
  console.log(`Frame 0: ${png0.length} bytes`);

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

    // fdAT data (skip 4-byte sequence number)
    const fdatData = fdatChunks[i].data.slice(4);
    const fdatRaw = inflateSync(fdatData);
    const framePixels = defilterScanlines(fdatRaw, fw, fh, bpp);

    // Create full-size composition with this frame region
    // For emoji with blend_over, we overlay the frame data on top of previous frame
    // Simple approach: place frame pixels in full-size canvas
    const fullRGBA = Buffer.alloc(srcW * srcH * 4, 0);
    const frameRGBA = toRGBA(framePixels, fw, fh);
    for (let row = 0; row < fh; row++) {
      for (let col = 0; col < fw; col++) {
        const srcIdx = (row * fw + col) * 4;
        if (row + fy < srcH && col + fx < srcW) {
          const dstIdx = ((row + fy) * srcW + (col + fx)) * 4;
          fullRGBA[dstIdx] = frameRGBA[srcIdx];
          fullRGBA[dstIdx + 1] = frameRGBA[srcIdx + 1];
          fullRGBA[dstIdx + 2] = frameRGBA[srcIdx + 2];
          fullRGBA[dstIdx + 3] = frameRGBA[srcIdx + 3];
        }
      }
    }

    const pngN = await sharp(fullRGBA, { raw: { width: srcW, height: srcH, channels: 4 } })
      .resize(128, 128, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toBuffer();
    frames.push({ png: pngN, delayNum: fdelayNum, delayDen: fdelayDen, disposeOp: fdisposeOp, blendOp: fblendOp });
    console.log(`Frame ${i + 1}: ${pngN.length} bytes`);
  }

  // ---- Mux APNG ----
  console.log("Muxing APNG...");
  const TARGET_W = 128;
  const TARGET_H = 128;

  // Build output chunks
  const outChunks = [];

  // IHDR
  const ihdrBuf = Buffer.alloc(13);
  ihdrBuf.writeUInt32BE(TARGET_W, 0);
  ihdrBuf.writeUInt32BE(TARGET_H, 4);
  ihdrBuf.writeUInt8(8, 8);  // bit depth
  ihdrBuf.writeUInt8(6, 9);  // color type RGBA
  ihdrBuf.writeUInt8(0, 10); // compression
  ihdrBuf.writeUInt8(0, 11); // filter
  ihdrBuf.writeUInt8(0, 12); // interlace
  outChunks.push({ type: "IHDR", data: ihdrBuf });

  // acTL
  const actlBuf = Buffer.alloc(8);
  actlBuf.writeUInt32BE(numFrames, 0);
  actlBuf.writeUInt32BE(numPlays, 4);
  outChunks.push({ type: "acTL", data: actlBuf });

  // For each frame: fcTL + frame data (IDAT for frame 0, fdAT for rest)
  for (let i = 0; i < frames.length; i++) {
    const f = frames[i];
    const png = f.png;

    // Parse the resized PNG to extract its IDAT
    const pngChunks = parseChunks(png);
    const pngIHDR = pngChunks.find(c => c.type === "IHDR");
    const pngIDATs = pngChunks.filter(c => c.type === "IDAT");
    const frameData = Buffer.concat(pngIDATs.map(c => c.data));

    // fcTL: sequence_number, width, height, x_offset, y_offset, delay_num, delay_den, dispose_op, blend_op
    const fctlBuf = Buffer.alloc(26);
    fctlBuf.writeUInt32BE(i, 0); // sequence_number
    fctlBuf.writeUInt32BE(TARGET_W, 4);
    fctlBuf.writeUInt32BE(TARGET_H, 8);
    fctlBuf.writeUInt32BE(0, 12); // x_offset
    fctlBuf.writeUInt32BE(0, 16); // y_offset
    fctlBuf.writeUInt16BE(f.delayNum, 20);
    fctlBuf.writeUInt16BE(f.delayDen, 22);
    fctlBuf.writeUInt8(f.disposeOp, 24);
    fctlBuf.writeUInt8(f.blendOp, 25);
    outChunks.push({ type: "fcTL", data: fctlBuf });

    if (i === 0) {
      // IDAT
      outChunks.push({ type: "IDAT", data: frameData });
    } else {
      // fdAT: sequence_number + frame_data
      const fdatOut = Buffer.alloc(4 + frameData.length);
      fdatOut.writeUInt32BE(i, 0); // same sequence number as fcTL (PNG spec says fdAT sequence)
      frameData.copy(fdatOut, 4);
      outChunks.push({ type: "fdAT", data: fdatOut });
    }
  }

  // IEND
  outChunks.push({ type: "IEND", data: Buffer.alloc(0) });

  // Write output
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
  console.log(`Wrote ${output} (${finalBuf.length} bytes, ${numFrames} frames)`);
}

main().catch(console.error);