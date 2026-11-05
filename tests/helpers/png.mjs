import zlib from 'node:zlib';

// Minimal PNG reader (8-bit RGB/RGBA, non-interlaced) so the test can read one pixel without an image library.
export function pixelAt(png, x, y) {
  let offset = 8; let width = 0; let channels = 0; const data = [];
  while (offset < png.length) {
    const length = png.readUInt32BE(offset); const type = png.toString('ascii', offset + 4, offset + 8);
    const body = png.subarray(offset + 8, offset + 8 + length);
    if (type === 'IHDR') { width = body.readUInt32BE(0); channels = body[9] === 6 ? 4 : 3; }
    if (type === 'IDAT') data.push(body);
    offset += 12 + length;
  }
  const raw = zlib.inflateSync(Buffer.concat(data));
  const stride = width * channels; const rows = [];
  for (let row = 0, pos = 0; pos < raw.length; row += 1) {
    const filter = raw[pos]; const line = Buffer.from(raw.subarray(pos + 1, pos + 1 + stride)); pos += 1 + stride;
    const prev = rows[row - 1] || Buffer.alloc(stride);
    for (let i = 0; i < stride; i += 1) {
      const a = i >= channels ? line[i - channels] : 0; const b = prev[i]; const c = i >= channels ? prev[i - channels] : 0;
      const predictor = [0, a, b, (a + b) >> 1, (() => { const p = a + b - c; const pa = Math.abs(p - a); const pb = Math.abs(p - b); const pc = Math.abs(p - c); return pa <= pb && pa <= pc ? a : pb <= pc ? b : c; })()][filter];
      line[i] = (line[i] + predictor) & 255;
    }
    rows.push(line);
  }
  const at = rows[y].subarray(x * channels, x * channels + 3);
  return { r: at[0], g: at[1], b: at[2] };
}
