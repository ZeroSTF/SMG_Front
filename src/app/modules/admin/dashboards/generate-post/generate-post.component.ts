import { CommonModule } from '@angular/common';
import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Subject } from 'rxjs';
import { RemoveBgService } from './services/remove-bg.service';
import { MatTooltipModule } from '@angular/material/tooltip';


interface PostTemplate {
  background: string;
  productPosition: { x: number, y: number, width: number, height: number };
  logoPosition: { x: number, y: number, width: number, height: number };
  descriptionPosition: { x: number, y: number, maxWidth: number, maxHeight: number };
}

@Component({
  selector: 'app-generate-post',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatTooltipModule
  ],
  templateUrl: './generate-post.component.html'
})
export class GeneratePostComponent implements OnInit, OnDestroy {
  @ViewChild('canvas', { static: false }) canvasRef: ElementRef<HTMLCanvasElement>;

  postForm: FormGroup;
  generatedImages: string[] = [];
  
  postTemplates: { [key: string]: PostTemplate[] } = {
    portrait: [
      {
        background: '/images/templates/bg-portrait-1.png',
        productPosition: { x: 150, y: 250, width: 780, height: 500 },
        logoPosition: { x: 800, y: 800, width: 200, height: 200 },
        descriptionPosition: { x: 150, y: 100, maxWidth: 700, maxHeight: 100 }
      },
      // TODO add more portrait templates...
    ],
    paysage: [
      {
        background: '/images/templates/bg-paysage-1.png',
        productPosition: { x: 150, y: 250, width: 780, height: 500 },
        logoPosition: { x: 800, y: 800, width: 200, height: 200 },
        descriptionPosition: { x: 150, y: 100, maxWidth: 700, maxHeight: 100 }
      },
      // TODO add more paysage templates...
    ],
    carre: [
      {
        background: '/images/templates/bg-carre-1.png',
        productPosition: { x: 7, y: 220, width: 1065, height: 525 },
        logoPosition: { x: 540, y: 744, width: 532, height: 326 },
        descriptionPosition: { x: 790, y: 235, maxWidth: 570, maxHeight: 100 }
      },
      {
        background: '/images/templates/bg-carre-2.png',
        productPosition: { x: 150, y: 250, width: 780, height: 500 },
        logoPosition: { x: 800, y: 800, width: 200, height: 200 },
        descriptionPosition: { x: 150, y: 100, maxWidth: 700, maxHeight: 100 }
      }
    ]
  };
  
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  
  constructor(private fb: FormBuilder, private removeBgService: RemoveBgService, private changeDetectorRef: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.postForm = this.fb.group({
      description: ['', Validators.required],
      productImages: [[]],
      logos: [[]],
      format: ['', Validators.required]
    });
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }

  onFileSelected(event: any, type: 'productImages' | 'logos'): void {
    const files = event.target.files;
    if (files) {
      const fileUrls = Array.from(files).map(file => ({
        url: URL.createObjectURL(file as Blob),
        file: file
      }));
      const currentUrls = this.postForm.get(type)?.value || [];
      this.postForm.patchValue({ [type]: [...currentUrls, ...fileUrls] });
    }
  }

  removeImage(index: number, type: 'productImages' | 'logos'): void {
    const currentUrls = this.postForm.get(type)?.value || [];
    currentUrls.splice(index, 1);
    this.postForm.patchValue({ [type]: currentUrls });
  }

  async generatePosts(): Promise<void> {
    if (this.postForm.valid) {
      const { description, productImages, logos, format } = this.postForm.value;
      const templates = this.postTemplates[format];
      
      this.generatedImages = [];
      
      for (const template of templates) {
        const canvas = this.canvasRef.nativeElement;
        const ctx = canvas.getContext('2d');
        
        // Set canvas size based on format
        if (format === 'portrait') {
          canvas.width = 1080;
          canvas.height = 1350;
        } else if (format === 'paysage') {
          canvas.width = 1350;
          canvas.height = 1080;
        } else {
          canvas.width = 1080;
          canvas.height = 1080;
        }
        
        // Draw background
        const bgImage = await this.loadImage(template.background);
        ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);
        
        // Draw product images
        await this.drawMultipleImages(ctx, productImages, template.productPosition);

        // Draw logos
        await this.drawMultipleImages(ctx, logos, template.logoPosition);
        
        // Draw description
        ctx.font = 'bold 55px Monteserrat';
        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        const descPos = template.descriptionPosition;
        this.wrapText(ctx, description, descPos.x, descPos.y, descPos.maxWidth, 40);
        
        this.generatedImages.push(canvas.toDataURL());
      }
    }
  }
  
  private async drawMultipleImages(ctx: CanvasRenderingContext2D, images: any[], position: { x: number, y: number, width: number, height: number }): Promise<void> {
    const imageCount = images.length;
    if (imageCount === 0) return;
  
    const gap = 10; // Gap between images
    let totalWidth = position.width;
    let totalHeight = position.height;
  
    if (imageCount > 1) {
      totalWidth -= (imageCount - 1) * gap;
    }
  
    const imageWidth = totalWidth / imageCount;
    const imageHeight = position.height;
  
    for (let i = 0; i < imageCount; i++) {
      const img = await this.loadImage(images[i]);
      const x = position.x + (imageWidth + gap) * i;
      const y = position.y;
      this.drawImageFit(ctx, img, x, y, imageWidth, imageHeight);
    }
  }

  private loadImage(src: string | { url: string, file: File }): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = typeof src === 'string' ? src : src.url;
    });
  }

  private wrapText(context: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number) {
    const words = text.split(' ');
    let line = '';

    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = context.measureText(testLine);
      const testWidth = metrics.width;
      if (testWidth > maxWidth && n > 0) {
        context.fillText(line, x, y);
        line = words[n] + ' ';
        y += lineHeight;
      } else {
        line = testLine;
      }
    }
    context.fillText(line, x, y);
  }

  // Helper function to draw image fitting in a specified rectangle
  private drawImageFit(ctx: CanvasRenderingContext2D, img: HTMLImageElement, x: number, y: number, width: number, height: number) {
    const aspectRatio = img.width / img.height;
    let drawWidth = width;
    let drawHeight = height;
    
    if (width / height > aspectRatio) {
      drawWidth = height * aspectRatio;
    } else {
      drawHeight = width / aspectRatio;
    }
    
    const drawX = x + (width - drawWidth) / 2;
    const drawY = y + (height - drawHeight) / 2;
    
    ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
  }

  async removeBackground(file: File, type: 'productImages' | 'logos', index: number): Promise<void> {
    try {
      const blob = await this.removeBgService.removeBackground(file).toPromise();
      const url = URL.createObjectURL(blob);
      
      const currentUrls = this.postForm.get(type)?.value || [];
      currentUrls[index] = { url: url, file: new File([blob], file.name, { type: blob.type }) };
      this.postForm.patchValue({ [type]: currentUrls });
      
      // Force change detection
      this.changeDetectorRef.detectChanges();
    } catch (error) {
      console.error('Error removing background:', error);
      // Handle error (e.g., show a message to the user)
    }
  }
}
