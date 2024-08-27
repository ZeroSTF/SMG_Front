import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import Konva from 'konva';
import { Subject } from 'rxjs';

@Component({
    selector: 'example',
    templateUrl: './example.component.html',
    standalone: true,
    imports: [MatIconModule],
})
export class ExampleComponent implements OnInit {
    @ViewChild('container', { static: true })
    containerEl: ElementRef<HTMLDivElement>;
    private stage: Konva.Stage;
    private layer: Konva.Layer;
    private unsubscribe$ = new Subject<void>();

    constructor() {}

    ngOnInit(): void {
        this.initStage();
        this.loadPostData();
    }

    ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }

    private initStage(): void {
        this.stage = new Konva.Stage({
            container: this.containerEl.nativeElement,
            width: 1080,
            height: 1080,
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
        backgroundImage.src = '/images/templates/bg-carre-1.png';

        // Add title text
        const titleGroup = new Konva.Group({
            x: 790,
            y: 200,
            width: 570,
            height: 132,
            draggable: true,
        });

        const text = new Konva.Text({
            x: 0,
            y: 0,
            width: titleGroup.width(),
            text: 'testing the alignement',
            fontSize: 40,
            fontFamily: 'Monteserrat',
            fontStyle: 'bold',
            fill: 'white',
            align: 'right',
        });
        const text2 = new Konva.Text({
            x: 0,
            y: 50,
            width: titleGroup.width(),
            text: 'hello',
            fontSize: 40,
            fontFamily: 'Monteserrat',
            fontStyle: 'bold',
            fill: 'white',
            align: 'right',
        });
        titleGroup.add(text);
        titleGroup.add(text2);

        // Added delay to allow Konva to render the stage
        setTimeout(() => {
            this.layer.add(titleGroup);
            this.layer.draw();
        }, 2000);
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
