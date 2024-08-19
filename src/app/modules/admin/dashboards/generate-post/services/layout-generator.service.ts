import { Injectable } from '@angular/core';

interface LayoutElement {
  type: 'image' | 'text' | 'logo';
  x: number;
  y: number;
  width: number;
  height: number;
  content: string;
  style?: any;
}

@Injectable({
  providedIn: 'root'
})
export class LayoutGeneratorService {
  generateLayout(format: string, adCopy: string, imageUrls: string[], logoUrl: string, hashtags: string[]): LayoutElement[] {
    const layout: LayoutElement[] = [];
    const canvasWidth = format === 'portrait' ? 1080 : 1350;
    const canvasHeight = format === 'portrait' ? 1350 : 1080;

    // Generate a color scheme
    const baseColor = this.getRandomColor();
    const colorScheme = {
      background: this.lightenColor(baseColor, 20),
      text: this.darkenColor(baseColor, 30),
      accent: this.complementColor(baseColor)
    };

    // Add background
    layout.push({
      type: 'image',
      x: 0,
      y: 0,
      width: canvasWidth,
      height: canvasHeight,
      content: colorScheme.background
    });

    // Add main image
    layout.push({
      type: 'image',
      x: canvasWidth * 0.1,
      y: canvasHeight * 0.1,
      width: canvasWidth * 0.8,
      height: canvasHeight * 0.5,
      content: imageUrls[0]
    });

    // Add ad copy
    layout.push({
      type: 'text',
      x: canvasWidth * 0.1,
      y: canvasHeight * 0.65,
      width: canvasWidth * 0.8,
      height: canvasHeight * 0.2,
      content: adCopy,
      style: {
        font: 'bold 40px Arial',
        fillStyle: colorScheme.text,
        textAlign: 'center'
      }
    });

    // Add logo
    if (logoUrl) {
      layout.push({
        type: 'logo',
        x: canvasWidth * 0.8,
        y: canvasHeight * 0.85,
        width: canvasWidth * 0.15,
        height: canvasHeight * 0.1,
        content: logoUrl
      });
    }

    // Add hashtags
    layout.push({
      type: 'text',
      x: canvasWidth * 0.1,
      y: canvasHeight * 0.9,
      width: canvasWidth * 0.6,
      height: canvasHeight * 0.05,
      content: hashtags.join(' '),
      style: {
        font: '20px Arial',
        fillStyle: colorScheme.accent,
        textAlign: 'left'
      }
    });

    return layout;
  }

  private getRandomColor(): string {
    return '#' + Math.floor(Math.random()*16777215).toString(16);
  }

  private lightenColor(color: string, amount: number): string {
    return this.adjustColor(color, amount);
  }

  private darkenColor(color: string, amount: number): string {
    return this.adjustColor(color, -amount);
  }

  private adjustColor(color: string, amount: number): string {
    const num = parseInt(color.slice(1), 16);
    const r = Math.min(255, Math.max(0, (num >> 16) + amount));
    const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + amount));
    const b = Math.min(255, Math.max(0, (num & 0x0000FF) + amount));
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
  }

  private complementColor(color: string): string {
    const num = parseInt(color.slice(1), 16);
    const complement = 0xFFFFFF ^ num;
    return `#${complement.toString(16).padStart(6, '0')}`;
  }
}