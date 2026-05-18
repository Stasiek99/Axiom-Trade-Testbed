import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';

@Component({
  selector: 'app-wave-background',
  standalone: true,
  template: `<canvas #canvas class="wave-canvas"></canvas>`,
  styles: [`
    .wave-canvas {
      position: fixed;
      inset: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 0;
    }
  `]
})
export class WaveBackgroundComponent implements OnInit, OnDestroy {
  @ViewChild('canvas', { static: true }) private canvasRef!: ElementRef<HTMLCanvasElement>;

  private worker: Worker | null = null;
  private resizeHandler!: () => void;

  // ── Fallback state (used when OffscreenCanvas/Worker unavailable) ─────────
  private fallbackRafId = 0;
  private ctx: CanvasRenderingContext2D | null = null;
  private imgData: ImageData | null = null;
  private fallbackBuf: Uint8ClampedArray | null = null;
  private bufCanvas: HTMLCanvasElement | null = null;
  private bufCtx: CanvasRenderingContext2D | null = null;
  private startTime = 0;

  private readonly TABLE = 1024;
  private readonly SIN_TABLE = new Float32Array(1024);
  private readonly COS_TABLE = new Float32Array(1024);
  private readonly SCALE = 2;

  ngOnInit(): void {
    const canvas = this.canvasRef.nativeElement;

    if (typeof Worker !== 'undefined' && typeof OffscreenCanvas !== 'undefined') {
      this.initWorker(canvas);
    } else {
      this.initFallback(canvas);
    }
  }

  ngOnDestroy(): void {
    if (this.worker) {
      this.worker.postMessage({ type: 'stop' });
      this.worker.terminate();
    } else {
      cancelAnimationFrame(this.fallbackRafId);
    }
    window.removeEventListener('resize', this.resizeHandler);
  }

  // ── Worker path ───────────────────────────────────────────────────────────

  private initWorker(canvas: HTMLCanvasElement): void {
    const offscreen = canvas.transferControlToOffscreen();
    this.worker = new Worker(
      new URL('./wave-background.worker', import.meta.url),
      { type: 'module' }
    );
    this.worker.postMessage(
      { type: 'init', canvas: offscreen, w: window.innerWidth, h: window.innerHeight },
      [offscreen]
    );
    this.resizeHandler = () => {
      this.worker!.postMessage({ type: 'resize', w: window.innerWidth, h: window.innerHeight });
    };
    window.addEventListener('resize', this.resizeHandler);
  }

  // ── Fallback path (main-thread) ───────────────────────────────────────────

  private initFallback(canvas: HTMLCanvasElement): void {
    for (let i = 0; i < this.TABLE; i++) {
      const a = (i / this.TABLE) * Math.PI * 2;
      this.SIN_TABLE[i] = Math.sin(a);
      this.COS_TABLE[i] = Math.cos(a);
    }
    this.ctx = canvas.getContext('2d')!;
    this.resizeHandler = () => this.fallbackResize(canvas);
    window.addEventListener('resize', this.resizeHandler);
    this.fallbackResize(canvas);
    this.startTime = Date.now();
    this.fallbackRender();
  }

  private fallbackResize(canvas: HTMLCanvasElement): void {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    const bw = Math.floor(canvas.width  / this.SCALE);
    const bh = Math.floor(canvas.height / this.SCALE);
    this.bufCanvas = document.createElement('canvas');
    this.bufCanvas.width  = bw;
    this.bufCanvas.height = bh;
    this.bufCtx = this.bufCanvas.getContext('2d')!;
    this.imgData = this.bufCtx.createImageData(bw, bh);
    this.fallbackBuf = this.imgData.data;
  }

  private fallbackRender = (): void => {
    if (!this.ctx || !this.bufCtx || !this.imgData || !this.fallbackBuf || !this.bufCanvas) return;

    const time = (Date.now() - this.startTime) * 0.001;
    const bw = this.bufCanvas.width;
    const bh = this.bufCanvas.height;
    const mask = this.TABLE - 1;
    const inv  = this.TABLE / (Math.PI * 2);

    const fsin = (x: number) => this.SIN_TABLE[(((x % (Math.PI * 2)) * inv) | 0) & mask];
    const fcos = (x: number) => this.COS_TABLE[(((x % (Math.PI * 2)) * inv) | 0) & mask];

    const buf = this.fallbackBuf;
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

    this.bufCtx.putImageData(this.imgData, 0, 0);
    this.ctx.imageSmoothingEnabled = false;
    this.ctx.drawImage(this.bufCanvas, 0, 0, bw, bh, 0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

    this.fallbackRafId = requestAnimationFrame(this.fallbackRender);
  };
}
