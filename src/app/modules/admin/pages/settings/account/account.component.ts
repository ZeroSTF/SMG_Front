import { TextFieldModule } from '@angular/cdk/text-field';
import {
    ChangeDetectionStrategy,
    Component,
    OnDestroy,
    OnInit,
    ViewEncapsulation,
} from '@angular/core';
import {
    FormsModule,
    ReactiveFormsModule,
    UntypedFormBuilder,
    UntypedFormGroup,
    Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { AuthService } from 'app/core/auth/auth.service';
import { UserService } from 'app/core/user/user.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
    selector: 'settings-account',
    templateUrl: './account.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [
        FormsModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        TextFieldModule,
        MatSelectModule,
        MatOptionModule,
        MatButtonModule,
    ],
})
export class SettingsAccountComponent implements OnInit, OnDestroy {
    accountForm: UntypedFormGroup;
    currentUser: any;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    /**
     * Constructor
     */
    constructor(private _formBuilder: UntypedFormBuilder, private _authService: AuthService, private _userService: UserService, private _snackBar: MatSnackBar, private _router: Router) {}

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        // Create the form
        this.accountForm = this._formBuilder.group({
            nom: ['', Validators.required],
            // username: ['', Validators.required],
            banque: ['', Validators.required],
            fax: [''],
            // about: [''],
            email: ['', [Validators.required, Validators.email]],
            tel1: [''],
            tel2: ['', Validators.required],
            // country: [''],
            adresse: ['', Validators.required],
        });

        // Get the current user
        this._authService.getCurrentUser().pipe(takeUntil(this._unsubscribeAll))
        .subscribe((user) => {
            this.currentUser = user;
            this.accountForm.patchValue({
                nom: user.nom,
                banque: user.banque,
                fax: user.fax,
                email: user.email,
                tel1: user.tel1,
                tel2: user.tel2,
                adresse: user.adresse,
            });
        }
        );
    }

    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    enregistrer(): void {
        // Do nothing if the form is invalid
        if (this.accountForm.invalid) {
            return;
        }

        // Do nothing if the form is unchanged
        if (this.accountForm.pristine) {
            if(this.currentUser.role[0].id === 3){
                this._snackBar.open('Merci d\'avoir confirmé vos informations ! ', 'OK', {
                    verticalPosition: 'top',
                    duration: 2000,
                });
                this._router.navigate(['/home']);
            }
            return
        }

        // If email is changed, set current user's status to 'Unconfirmed'
        if (this.currentUser.email !== this.accountForm.value.email) {
            this.currentUser.status = 'Unconfirmed';

            //show a message that the user needs to confirm their email
            this._snackBar.open('Veuillez confirmer votre e-mail', 'OK', {
                verticalPosition: 'top',
                duration: 2000,
            });
        }

        // Save the changed values to current User
        this.currentUser.nom = this.accountForm.value.nom;
        this.currentUser.banque = this.accountForm.value.banque;
        this.currentUser.fax = this.accountForm.value.fax;
        this.currentUser.email = this.accountForm.value.email;
        this.currentUser.tel1 = this.accountForm.value.tel1;
        this.currentUser.tel2 = this.accountForm.value.tel2;
        this.currentUser.adresse = this.accountForm.value.adresse;

        // Save the user
        this._userService.update(this.currentUser).subscribe(() => {
            // Show a success message
            this._snackBar.open('Profile enregistré', 'OK', {
                verticalPosition: 'top',
                duration: 2000,
            });
        });

    }

    annuler(): void {
        //reset form to current user's values
        this.accountForm.patchValue({
            nom: this.currentUser.nom,
            banque: this.currentUser.banque,
            fax: this.currentUser.fax,
            email: this.currentUser.email,
            tel1: this.currentUser.tel1,
            tel2: this.currentUser.tel2,
            adresse: this.currentUser.adresse,
        });
    }

}
