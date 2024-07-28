import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import {
    FormsModule,
    NgForm,
    ReactiveFormsModule,
    UntypedFormBuilder,
    UntypedFormGroup,
    Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router, RouterLink } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { FuseAlertComponent, FuseAlertType } from '@fuse/components/alert';
import { AuthService } from 'app/core/auth/auth.service';
import { UserService } from 'app/core/user/user.service';

@Component({
    selector: 'auth-sign-up',
    templateUrl: './sign-up.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations,
    standalone: true,
    imports: [
        RouterLink,
        FuseAlertComponent,
        FormsModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatIconModule,
        MatCheckboxModule,
        MatProgressSpinnerModule,
    ],
})
export class AuthSignUpComponent implements OnInit {
    @ViewChild('signUpNgForm') signUpNgForm: NgForm;

    alert: { type: FuseAlertType; message: string } = {
        type: 'success',
        message: '',
    };
    signUpForm: UntypedFormGroup;
    showAlert: boolean = false;

    imageSrc: string | ArrayBuffer | null = null;
    fileData = new FormData();
    isPhotoSelected = false;
    selectedImageUrl: string | ArrayBuffer | null = null;

    /**
     * Constructor
     */
    constructor(
        private _authService: AuthService,
        private _formBuilder: UntypedFormBuilder,
        private _router: Router,
        private _userService: UserService
    ) {}

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        // Create the form
        this.signUpForm = this._formBuilder.group({
            nom: ['', Validators.required],
            email: ['', [Validators.required, Validators.email]],
            password: ['', Validators.required],
            adresse: ['', Validators.required],
            tel1: [''],
            tel2: ['', Validators.required],
            fax: [''],
            idfiscal: ['', Validators.required],
            mat: [null],
            agreements: ['', Validators.requiredTrue],
        });
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Sign up
     */
    signUp(): void {
        // Do nothing if the form is invalid
        if (this.signUpForm.invalid) {
            return;
        }

        // Disable the form
        this.signUpForm.disable();

        // Hide the alert
        this.showAlert = false;
        // Sign up
        this._authService.signUp(this.signUpForm.value).subscribe(
            (response) => {

                if (this.isPhotoSelected) {
                    // Call the userService.uploadPhoto() function to upload the photo
                    this._userService.uploadPhoto(this.fileData, response.id).subscribe(
                      (response: any) => {
                        console.log('Photo uploaded successfully:', response);
                      },
                      (error: any) => {
                        console.error('Failed to upload photo:', error);
                      }
                    );
                  }

                // Navigate to the confirmation required page
                this._router.navigateByUrl('/confirmation-required');
            },
            (response) => {
                // Re-enable the form
                this.signUpForm.enable();

                // Reset the form
                this.signUpNgForm.resetForm();

                // Set the alert
                this.alert = {
                    type: 'error',
                    message: 'Something went wrong, please try again.',
                };

                // Show the alert
                this.showAlert = true;
            }
        );
    }

    openFileDialog(): void {
        const fileInput = document.getElementById('mat') as HTMLInputElement;
        fileInput?.click();
      }
    
    onFileChange(event: Event): void {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files.length) {
          const file = input.files[0];
          this.signUpForm.get('mat')?.setValue(file);
    
          const reader = new FileReader();
          reader.onload = () => {
            this.imageSrc = reader.result;
          };
          reader.readAsDataURL(file);
        } else {
          this.imageSrc = null;
        }
    }

    onFileSelected(event: any) {
        const file = event.target.files[0];
        if (!file) {
          return;
        }
    
        // Create a URL object from the file
        const fileUrl = URL.createObjectURL(file);
        this.selectedImageUrl = fileUrl;
    
        // Populate fileData object to send the file
        this.fileData.append('file', file);
        this.isPhotoSelected = true;
      }
}
