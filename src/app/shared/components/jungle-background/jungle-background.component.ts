import { Component, HostListener, Input, OnDestroy, OnInit } from '@angular/core';

interface AmbientParticle {
  id: number;
  x: number;
  y: number;
  delay: number;
  duration: number;
  size: number;
}

@Component({
  selector: 'app-jungle-background',
  templateUrl: './jungle-background.component.html',
  styleUrls: ['./jungle-background.component.scss'],
  standalone: false,
})
export class JungleBackgroundComponent implements OnInit, OnDestroy {
  @Input() variant: 'full' | 'subtle' = 'full';

  readonly particles: AmbientParticle[] = Array.from({ length: 18 }, (_, i) => ({
    id: i,
    x: 8 + ((i * 41) % 84),
    y: 10 + ((i * 29) % 80),
    delay: (i * 1.4) % 14,
    duration: 16 + (i % 5) * 2,
    size: 1.5 + (i % 3),
  }));

  parallaxVoid = '';
  parallaxFar = '';
  parallaxMid = '';
  parallaxFront = '';
  parallaxFogFar = '';
  parallaxFogMid = '';
  parallaxFogNear = '';
  parallaxLight = '';

  private tiltX = 0;
  private tiltY = 0;
  private autoPhase = 0;
  private rafId = 0;
  private running = true;

  ngOnInit(): void {
    this.tick();
  }

  ngOnDestroy(): void {
    this.running = false;
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
    }
  }

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {
    this.tiltX = (event.clientX / window.innerWidth - 0.5) * 2;
    this.tiltY = (event.clientY / window.innerHeight - 0.5) * 2;
  }

  @HostListener('document:touchmove', ['$event'])
  onTouchMove(event: TouchEvent): void {
    const touch = event.touches[0];
    if (!touch) {
      return;
    }
    this.tiltX = (touch.clientX / window.innerWidth - 0.5) * 2;
    this.tiltY = (touch.clientY / window.innerHeight - 0.5) * 2;
  }

  private tick = (): void => {
    if (!this.running) {
      return;
    }
    this.autoPhase += 0.0048;
    const autoX = Math.sin(this.autoPhase) * 0.45;
    const autoY = Math.cos(this.autoPhase * 0.82) * 0.32;
    const mx = this.tiltX + autoX;
    const my = this.tiltY + autoY;

    this.parallaxVoid = `translate3d(${mx * 6}px, ${my * 5}px, 0)`;
    this.parallaxFar = `translate3d(${mx * 14}px, ${my * 11}px, 0) scale(1.06)`;
    this.parallaxMid = `translate3d(${mx * 28}px, ${my * 22}px, 0) scale(1.03)`;
    this.parallaxFront = `translate3d(${mx * 46}px, ${my * 36}px, 0) scale(1.01)`;
    this.parallaxFogFar = `translate3d(${mx * 10}px, ${my * 16}px, 0)`;
    this.parallaxFogMid = `translate3d(${mx * 20}px, ${my * 26}px, 0)`;
    this.parallaxFogNear = `translate3d(${mx * 32}px, ${my * 20}px, 0)`;
    this.parallaxLight = `translate3d(${mx * 8}px, ${my * 12}px, 0)`;

    this.rafId = requestAnimationFrame(this.tick);
  };
}
