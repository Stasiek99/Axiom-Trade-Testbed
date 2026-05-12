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

  private animFrameId = 0;
  private resizeHandler!: () => void;

  private readonly SCALE = 2;
  private readonly SIN_TABLE = new Float32Array(1024);
  private readonly COS_TABLE = new Float32Array(1024);

  private width = 0;
  private height = 0;
  private imageData!: ImageData;
  private data!: Uint8ClampedArray;
  private startTime = 0;
  private ctx!: CanvasRenderingContext2D;

  ngOnInit(): void {
    const canvas = this.canvasRef.nativeElement;
    this.ctx = canvas.getContext('2d')!;

    for (let i = 0; i < 1024; i++) {
      const angle = (i / 1024) * Math.PI * 2;
      this.SIN_TABLE[i] = Math.sin(angle);
      this.COS_TABLE[i] = Math.cos(angle);
    }

    this.resizeHandler = () => this.resize();
    window.addEventListener('resize', this.resizeHandler);
    this.resize();

    this.startTime = Date.now();
    this.render();
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.animFrameId);
    window.removeEventListener('resize', this.resizeHandler);
  }

  private resize(): void {
    const canvas = this.canvasRef.nativeElement;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    this.width = Math.floor(canvas.width / this.SCALE);
    this.height = Math.floor(canvas.height / this.SCALE);
    this.imageData = this.ctx.createImageData(this.width, this.height);
    this.data = this.imageData.data;
  }

  private fastSin(x: number): number {
    const index = Math.floor(((x % (Math.PI * 2)) / (Math.PI * 2)) * 1024) & 1023;
    return this.SIN_TABLE[Math.abs(index)];
  }

  private fastCos(x: number): number {
    const index = Math.floor(((x % (Math.PI * 2)) / (Math.PI * 2)) * 1024) & 1023;
    return this.COS_TABLE[Math.abs(index)];
  }

  private render = (): void => {
    const time = (Date.now() - this.startTime) * 0.001;
    const { width, height, data } = this;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const u_x = (2 * x - width) / height;
        const u_y = (2 * y - height) / height;

        let a = 0;
        let d = 0;

        for (let i = 0; i < 4; i++) {
          a += this.fastCos(i - d + time * 0.5 - a * u_x);
          d += this.fastSin(i * u_y + a);
        }

        const wave      = (this.fastSin(a) + this.fastCos(d)) * 0.5;
        const intensity = 0.3 + 0.4 * wave;
        const baseVal   = 0.1 + 0.15 * this.fastCos(u_x + u_y + time * 0.3);
        const blueAcc   = 0.2  * this.fastSin(a * 1.5 + time * 0.2);
        const purpleAcc = 0.15 * this.fastCos(d * 2   + time * 0.1);

        const r = Math.max(0, Math.min(1, baseVal + purpleAcc * 0.8)) * intensity;
        const g = Math.max(0, Math.min(1, baseVal + blueAcc   * 0.6)) * intensity;
        const b = Math.max(0, Math.min(1, baseVal + blueAcc   * 1.2 + purpleAcc * 0.4)) * intensity;

        const idx = (y * width + x) * 4;
        data[idx]     = r * 255;
        data[idx + 1] = g * 255;
        data[idx + 2] = b * 255;
        data[idx + 3] = 255;
      }
    }

    const canvas = this.canvasRef.nativeElement;
    this.ctx.putImageData(this.imageData, 0, 0);

    this.ctx.imageSmoothingEnabled = false;
    this.ctx.drawImage(canvas, 0, 0, width, height, 0, 0, canvas.width, canvas.height);

    this.animFrameId = requestAnimationFrame(this.render);
  };
}
