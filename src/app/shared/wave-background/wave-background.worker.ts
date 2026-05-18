/// <reference lib="webworker" />

const TABLE = 1024;
const SIN_TABLE = new Float32Array(TABLE);
const COS_TABLE = new Float32Array(TABLE);
for (let i = 0; i < TABLE; i++) {
  const a = (i / TABLE) * Math.PI * 2;
  SIN_TABLE[i] = Math.sin(a);
  COS_TABLE[i] = Math.cos(a);
}

const TWO_PI_INV = TABLE / (Math.PI * 2);
const MASK = TABLE - 1;

function fsin(x: number): number {
  return SIN_TABLE[(((x % (Math.PI * 2)) * TWO_PI_INV) | 0) & MASK];
}
function fcos(x: number): number {
  return COS_TABLE[(((x % (Math.PI * 2)) * TWO_PI_INV) | 0) & MASK];
}

const SCALE = 2;
let display: OffscreenCanvas | null = null;
let dctx: OffscreenCanvasRenderingContext2D | null = null;
let buffer: OffscreenCanvas | null = null;
let bctx: OffscreenCanvasRenderingContext2D | null = null;
let imgData: ImageData | null = null;
let buf: Uint8ClampedArray | null = null;
let startTime = 0;
let rafId = 0;

function initBuffer(w: number, h: number): void {
  const bw = Math.floor(w / SCALE);
  const bh = Math.floor(h / SCALE);
  buffer = new OffscreenCanvas(bw, bh);
  bctx = buffer.getContext('2d')!;
  imgData = bctx.createImageData(bw, bh);
  buf = imgData.data;
}

function render(): void {
  if (!dctx || !bctx || !imgData || !buf || !buffer || !display) return;

  const time = (Date.now() - startTime) * 0.001;
  const bw = buffer.width;
  const bh = buffer.height;

  for (let y = 0; y < bh; y++) {
    for (let x = 0; x < bw; x++) {
      const ux = (2 * x - bw) / bh;
      const uy = (2 * y - bh) / bh;

      let a = 0, d = 0;
      for (let i = 0; i < 4; i++) {
        a += fcos(i - d + time * 0.5 - a * ux);
        d += fsin(i * uy + a);
      }

      const wave = (fsin(a) + fcos(d)) * 0.5;
      const intensity = 0.3 + 0.4 * wave;
      const base = 0.1 + 0.15 * fcos(ux + uy + time * 0.3);
      const blue = 0.2 * fsin(a * 1.5 + time * 0.2);
      const purp = 0.15 * fcos(d * 2 + time * 0.1);

      const r = Math.max(0, Math.min(1, base + purp * 0.8)) * intensity;
      const g = Math.max(0, Math.min(1, base + blue * 0.6)) * intensity;
      const b = Math.max(0, Math.min(1, base + blue * 1.2 + purp * 0.4)) * intensity;

      const idx = (y * bw + x) * 4;
      buf[idx]     = r * 255;
      buf[idx + 1] = g * 255;
      buf[idx + 2] = b * 255;
      buf[idx + 3] = 255;
    }
  }

  bctx.putImageData(imgData, 0, 0);
  dctx.imageSmoothingEnabled = false;
  dctx.drawImage(buffer, 0, 0, bw, bh, 0, 0, display.width, display.height);

  rafId = requestAnimationFrame(render);
}

self.addEventListener('message', ({ data }: MessageEvent) => {
  if (data.type === 'init') {
    display = data.canvas as OffscreenCanvas;
    display.width  = data.w;
    display.height = data.h;
    dctx = display.getContext('2d')!;
    initBuffer(data.w, data.h);
    startTime = Date.now();
    render();
  } else if (data.type === 'resize') {
    display!.width  = data.w;
    display!.height = data.h;
    initBuffer(data.w, data.h);
  } else if (data.type === 'stop') {
    cancelAnimationFrame(rafId);
  }
});
