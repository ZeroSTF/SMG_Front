import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import Konva from 'konva';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { PostDataService } from '../services/post-data.service';

@Component({
    selector: 'app-edit-post',
    templateUrl: './edit-post.component.html',
    standalone: true,
    imports: [MatIconModule],
})
export class EditPostComponent implements OnInit {
    @ViewChild('container', { static: true })
    containerEl: ElementRef<HTMLDivElement>;
    private stage: Konva.Stage;
    private layer: Konva.Layer;
    private postData: any;
    private unsubscribe$ = new Subject<void>();

    constructor(private postDataService: PostDataService) {}

    ngOnInit(): void {
        this.postDataService.postData$
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe((data) => {
                if (data) {
                    console.log('data: ', data);
                    this.postData = data;
                    this.initStage();
                    this.loadPostData();
                }
            });
    }

    ngOnDestroy(): void {
        this.postDataService.clearPostData();
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }

    private initStage(): void {
        this.stage = new Konva.Stage({
            container: this.containerEl.nativeElement,
            width: this.postData.canvas.width,
            height: this.postData.canvas.height,
        });
        this.layer = new Konva.Layer();
        this.stage.add(this.layer);
    }

    private loadPostData(): void {
        // Load background
        const backgroundImage = new Image();
        backgroundImage.onload = () => {
            const background = new Konva.Image({
                image: backgroundImage,
                width: this.stage.width(),
                height: this.stage.height(),
            });
            this.layer.add(background);
            this.layer.draw();
        };
        backgroundImage.src = this.postData.template.background;

        // Load product images
        if (this.postData.products) {
            this.postData.products.forEach((product: any) => {
                const img = new Image();
                img.onload = () => {
                    const konvaImage = new Konva.Image({
                        image: img,
                        x: product.x,
                        y: product.y,
                        width: product.width,
                        height: product.height,
                        draggable: true,
                    });
                    this.layer.add(konvaImage);
                    this.layer.draw();
                };
                img.src = product.url;
            });
        }

        // Load logos
        if (this.postData.logos) {
            this.postData.logos.forEach((logo: any) => {
                const img = new Image();
                img.onload = () => {
                    const konvaImage = new Konva.Image({
                        image: img,
                        x: logo.x,
                        y: logo.y,
                        width: logo.width,
                        height: logo.height,
                        draggable: true,
                    });
                    this.layer.add(konvaImage);
                    this.layer.draw();
                };
                img.src = logo.url;
            });
        }

        // Add title text
        const titleGroup = new Konva.Group({
            x: this.postData.title.lines[0].x,
            y: this.postData.title.lines[0].y,
            draggable: true,
        });

        this.postData.title.lines.forEach((line: any, index: number) => {
            const text = new Konva.Text({
                x: 0,
                y: this.postData.title.gap * index,
                text: line.text,
                fontSize: parseFloat(
                    this.postData.title.font.match(/\d+(\.\d+)?/)[0]
                ),
                fontFamily: this.postData.title.font.match(
                    /(?:\d+(?:\.\d+)?px|bold|italic|normal|light|medium|semi-bold|extra-bold|bolder|lighter)\s+([a-zA-Z]+(?:\s[a-zA-Z]+)*)*$/
                )[1],
                fill: this.postData.title.color,
                align: this.postData.title.align,
            });
            titleGroup.add(text);
        });
        this.layer.add(titleGroup);
        this.layer.draw();
    }

    addImage(): void {
        // Implement image upload and add to stage
    }

    addText(): void {
        const text = new Konva.Text({
            x: 100,
            y: 100,
            text: 'New Text',
            fontSize: 20,
            fontFamily: 'Monteserrat',
            fill: 'black',
            draggable: true,
        });
        this.layer.add(text);
        this.layer.draw();
    }

    deleteSelected(): void {
        const selectedShape = this.stage.findOne('.selected');
        if (selectedShape) {
            selectedShape.destroy();
            this.layer.draw();
        }
    }

    saveChanges(): void {
        const dataUrl = this.stage.toDataURL();
        // Implement save logic here
    }
}
