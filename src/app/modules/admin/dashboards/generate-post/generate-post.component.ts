import { CommonModule } from '@angular/common';
import {
    ChangeDetectorRef,
    Component,
    ElementRef,
    OnDestroy,
    OnInit,
    ViewChild,
} from '@angular/core';
import {
    FormBuilder,
    FormGroup,
    FormsModule,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { AiTextService } from './services/ai-text.service';
import { PostDataService } from './services/post-data.service';
import { RemoveBgService } from './services/remove-bg.service';

interface PostTemplate {
    background: string;
    products: {
        x: number;
        y: number;
        width: number;
        height: number;
        style: 'vertical' | 'horizontal';
    };
    logoPosition: { x: number; y: number; width: number; height: number };
    title: {
        x: number;
        y: number;
        maxWidth: number;
        maxHeight: number;
        font: string;
        color: string;
    };
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
        MatTooltipModule,
        MatCardModule,
        MatSnackBarModule,
        FormsModule,
    ],
    templateUrl: './generate-post.component.html',
})
export class GeneratePostComponent implements OnInit, OnDestroy {
    @ViewChild('canvas', { static: false })
    canvasRef: ElementRef<HTMLCanvasElement>;

    postForm: FormGroup;
    generatedImages: string[] = [];

    generatedAdCopy: string;
    isEditing: boolean = false;
    editedAdCopy: string = '';

    generatedTitle: string;

    generatedPostsData: any[] = [];

    postTemplates: { [key: string]: PostTemplate[] } = {
        portrait: [
            {
                background: '/images/templates/bg-portrait-1.png',
                products: {
                    x: 150,
                    y: 250,
                    width: 780,
                    height: 500,
                    style: 'vertical',
                },
                logoPosition: { x: 800, y: 800, width: 200, height: 200 },
                title: {
                    x: 150,
                    y: 100,
                    maxWidth: 700,
                    maxHeight: 100,
                    font: 'bold 80px Monteserrat',
                    color: 'white',
                },
            },
            // TODO add more portrait templates...
        ],
        paysage: [
            {
                background: '/images/templates/bg-paysage-1.png',
                products: {
                    x: 150,
                    y: 250,
                    width: 780,
                    height: 500,
                    style: 'vertical',
                },
                logoPosition: { x: 800, y: 800, width: 200, height: 200 },
                title: {
                    x: 150,
                    y: 100,
                    maxWidth: 700,
                    maxHeight: 100,
                    font: 'bold 80px Monteserrat',
                    color: 'white',
                },
            },
            // TODO add more paysage templates...
        ],
        carre: [
            {
                background: '/images/templates/bg-carre-1.png',
                products: {
                    x: 48,
                    y: 288,
                    width: 996,
                    height: 459,
                    style: 'horizontal',
                },
                logoPosition: { x: 550, y: 744, width: 502, height: 326 },
                title: {
                    x: 780,
                    y: 216,
                    maxWidth: 550,
                    maxHeight: 132,
                    font: 'bold 80px Monteserrat',
                    color: 'white',
                },
            },
            {
                background: '/images/templates/bg-carre-2.png',
                products: {
                    x: 620,
                    y: 90,
                    width: 390,
                    height: 800,
                    style: 'vertical',
                },
                logoPosition: { x: 50, y: 600, width: 505, height: 305 },
                title: {
                    x: 297,
                    y: 485,
                    maxWidth: 433,
                    maxHeight: 230,
                    font: 'bold 80px Monteserrat',
                    color: 'black',
                },
            },
        ],
    };

    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        private fb: FormBuilder,
        private removeBgService: RemoveBgService,
        private changeDetectorRef: ChangeDetectorRef,
        private aiTextService: AiTextService,
        private snackBar: MatSnackBar,
        private router: Router,
        private postDataService: PostDataService,
        private route: ActivatedRoute
    ) {}

    ngOnInit(): void {
        this.postForm = this.fb.group({
            description: [''],
            productImages: [[]],
            logos: [[]],
            format: ['carre', Validators.required],
        });
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    onFileSelected(event: any, type: 'productImages' | 'logos'): void {
        const files = event.target.files;
        if (files) {
            const fileUrls = Array.from(files).map((file) => ({
                url: URL.createObjectURL(file as Blob),
                file: file,
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
        if (this.postForm.value.description) {
            // Generate ad copy
            this.aiTextService
                .generateAdCopy(this.postForm.value.description)
                .subscribe((generatedAdCopy: any) => {
                    console.log(generatedAdCopy);
                    this.generatedAdCopy = generatedAdCopy;
                    this.changeDetectorRef.detectChanges();
                });

            // Generate title and wait for it before creating the image
            await new Promise<void>((resolve) => {
                this.aiTextService
                    .generateTitle(this.postForm.value.description)
                    .subscribe((generatedTitle: any) => {
                        console.log(generatedTitle);
                        this.generatedTitle = generatedTitle;
                        this.changeDetectorRef.detectChanges();
                        resolve();
                    });
            });
        } else {
            this.generatedTitle = 'Position du Titre';
            //this.generatedAdCopy = 'Description du Produit';
        }

        if (this.postForm.valid) {
            const { description, productImages, logos, format } =
                this.postForm.value;
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
                const productPositions = await this.drawMultipleImages(
                    ctx,
                    productImages,
                    template.products
                );

                // Draw logos
                const logoPositions = await this.drawMultipleImages(
                    ctx,
                    logos,
                    template.logoPosition,
                    'logos'
                );

                // Draw title
                ctx.font = template.title.font;
                ctx.fillStyle = template.title.color;
                ctx.textAlign = 'center';
                const descPos = template.title;
                const titleLayout = this.wrapText(
                    ctx,
                    this.generatedTitle,
                    descPos.x,
                    descPos.y,
                    descPos.maxWidth,
                    descPos.maxHeight,
                    80,
                    10
                );

                this.generatedPostsData.push({
                    imageUrl: canvas.toDataURL(),
                    products: productPositions,
                    logos: logoPositions,
                    title: {
                        ...titleLayout,
                        color: template.title.color,
                        align: 'center',
                        font: template.title.font,
                    },
                    template: template,
                    format: format,
                });

                this.generatedImages.push(canvas.toDataURL());
            }
        }
    }

    private async drawMultipleImages(
        ctx: CanvasRenderingContext2D,
        images: any[],
        position: {
            x: number;
            y: number;
            width: number;
            height: number;
            style?: 'vertical' | 'horizontal';
        },
        type?: 'productImages' | 'logos'
    ): Promise<
        { url: string; x: number; y: number; width: number; height: number }[]
    > {
        const imageCount = images.length;
        if (imageCount === 0) return;
        const gap = 10; // Gap between images
        const isVertical = position.style === 'vertical';
        let totalWidth = position.width;
        let totalHeight = position.height;

        if (imageCount > 1) {
            if (isVertical) {
                totalHeight -= (imageCount - 1) * gap;
            } else {
                totalWidth -= (imageCount - 1) * gap;
            }
        }

        const imageWidth = isVertical ? totalWidth : totalWidth / imageCount;
        const imageHeight = isVertical ? totalHeight / imageCount : totalHeight;

        const calculatedPositions = [];

        if (type === 'logos' && imageCount === 1) {
            const logoWidth = imageWidth / 2;
            const logoHeight = imageHeight / 2;
            const img = await this.loadImage(images[0]);
            const x = position.x + (totalWidth - logoWidth) / 2;
            const y = position.y + (totalHeight - logoHeight) / 2;
            const fittedDims = this.drawImageFit(
                ctx,
                img,
                x,
                y,
                logoWidth,
                logoHeight
            );
            calculatedPositions.push({
                url: images[0].url,
                x: fittedDims.x,
                y: fittedDims.y,
                width: fittedDims.width,
                height: fittedDims.height,
            });
        } else {
            for (let i = 0; i < imageCount; i++) {
                const img = await this.loadImage(images[i]);
                const x = isVertical
                    ? position.x
                    : position.x + (imageWidth + gap) * i;
                const y = isVertical
                    ? position.y + (imageHeight + gap) * i
                    : position.y;
                const fittedDims = this.drawImageFit(
                    ctx,
                    img,
                    x,
                    y,
                    imageWidth,
                    imageHeight
                );
                calculatedPositions.push({
                    url: images[i].url,
                    x: fittedDims.x,
                    y: fittedDims.y,
                    width: fittedDims.width,
                    height: fittedDims.height,
                });
            }
        }
        return calculatedPositions;
    }

    private loadImage(
        src: string | { url: string; file: File }
    ): Promise<HTMLImageElement> {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = typeof src === 'string' ? src : src.url;
        });
    }

    private wrapText(
        context: CanvasRenderingContext2D,
        text: string,
        x: number,
        y: number,
        maxWidth: number,
        maxHeight: number,
        maxFontSize: number,
        minFontSize: number
    ): {
        fontSize: number;
        lines: { text: string; x: number; y: number }[];
        gap: number;
    } {
        // Find the largest font size that fits the text within the given dimensions
        const fontSize = this.findOptimalFontSize(
            context,
            text,
            maxWidth,
            maxHeight,
            maxFontSize,
            minFontSize
        );
        context.font = `bold ${fontSize}px Monteserrat`;

        // Split text into lines
        const words = text.split(' ');
        const lines: string[] = [];
        let currentLine = words[0];

        for (let i = 1; i < words.length; i++) {
            const testLine = currentLine + ' ' + words[i];
            const testWidth = context.measureText(testLine).width;

            if (testWidth <= maxWidth) {
                currentLine = testLine;
            } else {
                lines.push(currentLine);
                currentLine = words[i];
            }
        }
        lines.push(currentLine);

        // Calculate line height and total text height
        const lineHeight = fontSize * 1.2;
        const totalTextHeight = lineHeight * lines.length;

        // Calculate starting Y position to center the text vertically
        const startY = y - totalTextHeight / 2 + fontSize / 2;

        // Create the layout
        const layout = {
            fontSize: fontSize,
            lines: lines.map((line, i) => ({
                text: line,
                x: x,
                y: startY + i * lineHeight,
            })),
            gap: lineHeight,
        };

        // Draw the text
        context.textBaseline = 'middle';
        lines.forEach((line, i) => {
            context.fillText(line, x, layout.lines[i].y);
        });

        return layout;
    }

    private findOptimalFontSize(
        context: CanvasRenderingContext2D,
        text: string,
        maxWidth: number,
        maxHeight: number,
        maxFontSize: number,
        minFontSize: number
    ): number {
        let fontSize = maxFontSize;

        while (fontSize > minFontSize) {
            context.font = `bold ${fontSize}px Monteserrat`;
            const lines = this.getLines(context, text, maxWidth);
            const totalHeight = fontSize * 1.2 * lines.length;

            if (
                totalHeight <= maxHeight &&
                lines.every(
                    (line) => context.measureText(line).width <= maxWidth
                )
            ) {
                return fontSize;
            }

            fontSize--;
        }

        return minFontSize;
    }

    private getLines(
        context: CanvasRenderingContext2D,
        text: string,
        maxWidth: number
    ): string[] {
        const words = text.split(' ');
        const lines: string[] = [];
        let currentLine = words[0];

        for (let i = 1; i < words.length; i++) {
            const testLine = currentLine + ' ' + words[i];
            const testWidth = context.measureText(testLine).width;

            if (testWidth <= maxWidth) {
                currentLine = testLine;
            } else {
                lines.push(currentLine);
                currentLine = words[i];
            }
        }
        lines.push(currentLine);

        return lines;
    }

    // Helper function to draw image fitting in a specified rectangle
    private drawImageFit(
        ctx: CanvasRenderingContext2D,
        img: HTMLImageElement,
        x: number,
        y: number,
        width: number,
        height: number
    ): { x: number; y: number; width: number; height: number } {
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
        return { x: drawX, y: drawY, width: drawWidth, height: drawHeight };
    }

    async removeBackground(
        file: File,
        type: 'productImages' | 'logos',
        index: number
    ): Promise<void> {
        try {
            const blob = await this.removeBgService
                .removeBackground(file)
                .toPromise();
            const url = URL.createObjectURL(blob);

            const currentUrls = this.postForm.get(type)?.value || [];
            currentUrls[index] = {
                url: url,
                file: new File([blob], file.name, { type: blob.type }),
            };
            this.postForm.patchValue({ [type]: currentUrls });

            // Force change detection
            this.changeDetectorRef.detectChanges();
        } catch (error) {
            console.error('Error removing background:', error);
            // Handle error (e.g., show a message to the user)
        }
    }

    toggleEdit() {
        if (this.isEditing) {
            // Save the edited copy
            this.generatedAdCopy = this.editedAdCopy.trim();
            this.showSnackBar('Modifications enregistrées');
        } else {
            // Start editing
            this.editedAdCopy = this.generatedAdCopy;
        }
        this.isEditing = !this.isEditing;
    }

    copyAdCopy() {
        navigator.clipboard.writeText(this.generatedAdCopy).then(
            () => {
                this.showSnackBar('Texte copié dans le presse-papiers');
            },
            (err) => {
                console.error('Erreur lors de la copie du texte: ', err);
                this.showSnackBar('Erreur lors de la copie du texte');
            }
        );
    }

    private showSnackBar(message: string) {
        this.snackBar.open(message, 'Fermer', {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'bottom',
        });
    }

    editPost(index: number): void {
        const postData = this.generatedPostsData[index];

        const canvasData = {
            width:
                postData.format === 'portrait'
                    ? 1080
                    : postData.format === 'paysage'
                      ? 1350
                      : 1080,
            height:
                postData.format === 'portrait'
                    ? 1350
                    : postData.format === 'paysage'
                      ? 1080
                      : 1080,
        };

        const editData = {
            ...postData,
            canvas: canvasData,
        };

        this.postDataService.setPostData(editData);
        this.router.navigate(['edit'], {
            state: { postData: editData },
            relativeTo: this.route,
        });
    }
}
