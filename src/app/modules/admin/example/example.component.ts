import { Component, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

@Component({
    selector     : 'example',
    standalone   : true,
    templateUrl  : './example.component.html',
    encapsulation: ViewEncapsulation.None,
    imports      : [
        ReactiveFormsModule,
        MatInputModule,
        MatButtonModule,
        MatCardModule
    ]
})
export class ExampleComponent
{
    form: FormGroup;
  selectedImage: string | ArrayBuffer | null = null;

    /**
     * Constructor
     */
    constructor(private fb: FormBuilder)
    {
        this.form = this.fb.group({
            prompt: [''],
            image: [null]
          });
    }

    onFileSelected(event: Event): void {
        const file = (event.target as HTMLInputElement).files?.[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = () => {
            this.selectedImage = reader.result;
          };
          reader.readAsDataURL(file);
        }
      }

      generateArt(): void {
        const prompt = this.form.get('prompt')?.value;
        const image = this.selectedImage;
        // Implement your logic here to handle the prompt and image
        console.log('Prompt:', prompt);
        console.log('Image:', image);
      }
    
}
